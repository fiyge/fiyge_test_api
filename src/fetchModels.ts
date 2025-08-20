// src/fetchModels.ts

import axios from 'axios';
import fs from 'fs/promises';

async function fetchModels() {
    const response = await axios.get<{ data: Record<string, { children: Record<string, { url: string; }>; }> }>(
        "https://api.uat.fiyge.com/development_base/menus/app_menu.json",
        {
            headers: {
                Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
            }
        }
    );
    // console.log("response", response);
    const data: Record<string, { children: Record<string, { url: string }> }> | undefined = response?.data?.data
    // console.log("data", data);

    const modelList = data !== undefined ? Object.values(data).flatMap(child => Object.values(child.children)).filter(child => child !== undefined && child !== null).map(child => child.url).filter(url => url !== null && url !== undefined && !url.startsWith("crm/dashboard/?request_url")) : [];
    // console.log("modelList", modelList);
    const modifiedModelList = modelList.map(url => {
        const array = url.split("/");
        array.splice(array.length - 1, 1);
        return array.join("/");
    })
    await fs.writeFile('src/models.json', JSON.stringify(modifiedModelList, null, 2));
}

fetchModels().catch(console.error);