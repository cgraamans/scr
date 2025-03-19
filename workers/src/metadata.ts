import MetaDataDB from "./models/metadata-db";
import { App } from "index";
import urlMetadata from "url-metadata";

setInterval(async ()=> {

    try {

        console.log(`MetaData - ${(new Date()).getTime()}`);

        const metaDataDB = new MetaDataDB();

        const [newsList] = await metaDataDB.getNews(5);
        
        for (const newsListItem of newsList as any ) {

            await metaDataDB.setProc(newsListItem.id);

            const metadata = await urlMetadata(newsListItem.url,{requestHeaders:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36"}})
                .catch(e=>console.log(newsListItem.url,e));

            let image = null,
                description = null;

            if(metadata && metadata["og:image"]) image = metadata["og:image"];

            if(metadata && metadata["og:description"]) description = metadata["og:description"];

            let insertedMetaData = await metaDataDB.setMetaData(newsListItem.id,image,description)
                .catch(e=>console.log(e));

            return insertedMetaData;

        }

    } catch(e) {

        console.log(e);

    }

},30000);


