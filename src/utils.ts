// src/test-utils/payload.ts
import dayjs from 'dayjs';

/** Recursively pull required fields from form.children */
export function getRequiredFormFields(
    children: any[],
    requiredFields: { name: string; template?: string; permission?: string }[] = []
): typeof requiredFields {
    children.forEach((child: any) => {
        if (child['not_empty'] === '1' && child.name) {
            requiredFields.push({
                name: child.name,
                template: child.template || 'varchar',
                permission: child.permission,
            });
        }
        if (Array.isArray(child.children)) {
            getRequiredFormFields(child.children, requiredFields);
        }
    });
    return requiredFields;
}

/** Flatten infinite form.children */
export function flattenInfiniteFormChildren(children: any[]): any[] {
    const flattened: any[] = [];
    children.forEach((child: any) => {
        flattened.push(child);
        if (Array.isArray(child.children)) {
            flattened.push(...flattenInfiniteFormChildren(child.children));
        }
    });
    return flattened;
}

/** Build the JSON-RPC payload used for both add and edit */
export function constructEditPayload(
    editResponse: any,
    model: string,
    recordId: string | number,
    recordData: Record<string, any> | undefined
): any {
    // ----- same logic as constructPostPayload, only the method changes -----
    const methodArr = model.split('/').filter(Boolean);
    const controller = methodArr[methodArr.length - 1];
    methodArr.push('edit');                 // <-- edit instead of add
    const method = methodArr.join('.');

    const filterRules = editResponse.filterRules || {};
    const notEmptyFields = editResponse.notEmptyField?.[controller] || {};
    const notEmptyFieldKeys = Object.keys(notEmptyFields);

    const formChildren = editResponse.form?.children || [];
    const requiredFormFields = getRequiredFormFields(formChildren);
    const flattenFormChildren = flattenInfiniteFormChildren(formChildren);
    const filteredFormChildren = flattenFormChildren.filter(
        (c: any) => c.template !== undefined && c.template !== null && c.permission !== '1'
    );
    const filteredFormChildrenName = filteredFormChildren
        .map((c: any) => (c.name ? c.name.join('.') : ''))
        .filter(Boolean);

    const filterRulesRequiredFields = Object.keys(filterRules).filter((field) => {
        const rules = filterRules[field];
        if (!Array.isArray(rules)) return false;
        return rules.some(
            (r: any) =>
                r.rule === 'required' ||
                r.rule === '\\kernel\\validation::notEmpty' ||
                r.params?.options?.includes('notEmpty')
        );
    });

    const allRequiredFields = [
        ...new Set([
            ...notEmptyFieldKeys.filter((f) => filteredFormChildrenName.includes(f)),
            ...requiredFormFields.map((f: any) => f.name),
            ...filterRulesRequiredFields,
        ]),
    ];

    const filteredRequiredFields = allRequiredFields.filter((field) => {
        const fieldName = Array.isArray(field)
            ? [controller, ...field].join('.')
            : [controller, field].join('.');
        return filteredFormChildrenName.includes(fieldName);
    });

    const data: Record<string, any> = { ...recordData };
    delete data['workflow_record_actions'];

    filteredRequiredFields.forEach((field) => {
        const fieldName = Array.isArray(field)
            ? [controller, ...field].join('.')
            : [controller, field].join('.');
        const child = filteredFormChildren.find(
            (f: any) => f.name?.join('.') === fieldName
        );
        const fieldType = child?.template || (field.includes('_id') ? 'int' : 'varchar');
        const rules = filterRules[field] || [];

        const isDropdown = ['popup', 'select'].includes(fieldType);
        const isNumber = fieldType === 'number' || fieldType.includes('int') || field.includes('_id');
        const isDate = fieldType === 'date' || (fieldType === 'input' && child?.method === 'date');
        const isDatetime = fieldType === 'input' && child?.method === 'datetime';
        const isEmail = rules.some((r: any) => r.rule === '\\kernel\\validation::isValidEmail');
        const isPhone = rules.some((r: any) => r.rule === '\\kernel\\validation::isValidPhoneNumber');
        const notDuplicate = rules.some((r: any) => r.rule === '\\kernel\\validation::notDuplicate');
        const isIntNumber = rules.some((r: any) => r.rule === '\\kernel\\validation::isIntNumber');

        if (isEmail) {
            data[field] = data[field] ?? `test${field}@example.com`;
        } else if (isPhone) {
            data[field] = data[field] ?? '+14371234567';
        } else if (isDropdown || isNumber || isIntNumber) {
            data[field] = data[field] ?? 1;
        } else if (isDate) {
            data[field] = data[field] ?? dayjs().format('YYYY-MM-DD');
        } else if (isDatetime) {
            data[field] = data[field] ?? dayjs().format('YYYY-MM-DD HH:mm:ss');
        } else if (notDuplicate) {
            data[field] =
                data[field] ??
                `Test_${field.charAt(0).toUpperCase() + field.slice(1)}_${dayjs().format(
                    'YYYY-MM-DD HH:mm:ss'
                )}`;
        } else {
            data[field] = data[field] ?? `Test_${field.charAt(0).toUpperCase() + field.slice(1)}`;
        }
    });

    // ----- the only difference: we also send the record id -----
    return {
        method,
        jsonrpc: '2.0',
        params: {
            normalized: 1,
            action: { save_continue: 'Save & Continue' },
            data: { [controller]: { ...data, id: recordId } },
        },
        id: 1,
    };
}