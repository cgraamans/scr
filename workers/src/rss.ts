import RssDb from "./models/rss-db";
import RSSParser from "rss-parser";
// import { nanoid } from 'nanoid';
// import { RowDataPacket, FieldPacket } from "mysql2";
import { App } from "index";

setInterval(async ()=> {

    try {

        console.log(`RSS - ${(new Date()).getTime()}`);

        const parser = new RSSParser();
        const RssDB = new RssDb();

        const [sources] = await RssDB.getSources(1);
        
        for (const source of sources as App.RSS.source[] ) {

            const feed = await parser.parseURL(source.link)
                .catch(e=>{throw e});

            for (const item of feed.items as App.RSS.item[]) {

                console.log(item.title);

                const Link = await RssDB.setLink(item.link)

                if(Link.isActive === 0) return;
                Link.source = source.id;
                
                const processedItem = await RssDB.setItem(item,Link);

                console.log(processedItem);

            }

        }    

    } catch(e) {

        console.log(e);

    }


},30000);


