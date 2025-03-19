import i18nDB from "./models/i18n-db";
import { App } from "index";
import urlMetadata from "url-metadata";

setInterval(async ()=> {

    try {

        console.log(`i18n - ${(new Date()).getTime()}`);

        const i18DB = new i18nDB();

        const newsList = await i18DB.get(25);
        if(!newsList) return;

        // console.log(newsList);
        let timer = new Date().getTime();
        for (const newsListItem of newsList[0] as any ) {

            await i18DB.setProc(newsListItem.id);

            console.log(newsListItem.title);

            const tags = await i18DB.getTagsFromText(newsListItem.title);

            if(tags.tagIds.length > 0) {

                let tagList = [];
                for(let i=0,c=tags.tagIds.length;i<c;i++) {
                    tagList.push({newsId:newsListItem.id,tagId:tags.tagIds[i]});
                }

                const insertedTagNewsLinks = await i18DB.putNewsTags(tagList);
                console.log(insertedTagNewsLinks);

            }

        //     const metadata = await urlMetadata(newsListItem.url,{requestHeaders:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36"}})
        //         .catch(e=>console.log(newsListItem.url,e));

        //     let image = null,
        //         description = null;

        //     if(metadata && metadata["og:image"]) image = metadata["og:image"];

        //     if(metadata && metadata["og:description"]) description = metadata["og:description"];

        //     let insertedMetaData = await metaDataDB.setMetaData(newsListItem.id,image,description)
        //         .catch(e=>console.log(e));

        //     return insertedMetaData;

        }

        console.log(`TAGS: ${(new Date().getTime()) - timer}ms`);

    } catch(e) {

        console.log(e);

    }

},20000 + Math.floor((Math.random()*10000)));


// setInterval(async ()=> {

//     try {

//         console.log(`i18n - ${(new Date()).getTime()}`);

//         const i18DB = new i18nDB();

//         const newsList = await i18DB.get(25);
//         if(!newsList) return;

//         // console.log(newsList);
//         let timer = new Date().getTime();
//         for (const newsListItem of newsList[0] as any ) {

//             console.log(newsListItem.title);

//             const capitals = await i18DB.getCapitalsFromText(newsListItem.title);
//             console.log(capitals);

//         //     const metadata = await urlMetadata(newsListItem.url,{requestHeaders:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36"}})
//         //         .catch(e=>console.log(newsListItem.url,e));

//         //     let image = null,
//         //         description = null;

//         //     if(metadata && metadata["og:image"]) image = metadata["og:image"];

//         //     if(metadata && metadata["og:description"]) description = metadata["og:description"];

//         //     let insertedMetaData = await metaDataDB.setMetaData(newsListItem.id,image,description)
//         //         .catch(e=>console.log(e));

//         //     return insertedMetaData;

//         }

//         console.log(`Capitals: ${(new Date().getTime()) - timer}ms`);

//     } catch(e) {

//         console.log(e);

//     }

// },20000 + Math.floor((Math.random()*10000)));