import DB from "../services/db"
import {App} from '../../types/index'
import { nanoid } from "nanoid"
import { link } from "fs";

export default class RssDB {

    constructor(){}

    public async getSources(lim:number = 3) {

        return await DB.query(`
                SELECT s.id,s.link 
                FROM sources AS s 
                WHERE s.type = ? 
                    AND isActive = 1 
                ORDER BY rand() 
                LIMIT ?`,
            ["rss",lim])

    }

    public async setLink(link:string) {

        try {

            const linkSections = link.match(/([a-z0-9|-]+\.)*[a-z0-9|-]+\.[a-z]+/gm);
            const shortcode = linkSections[0].replace('www.','');
            let Link;
            
            const [isUnique] = await DB.query(`
                    SELECT id, isActive 
                    FROM links 
                    WHERE shortcode = ?`,
                [shortcode])
                .catch(e=>{throw e}) as any;

            if(isUnique.length>0) {
    
                Link = isUnique[0];
    
            } else {
    
                const [insertLinkResult] = await DB.query(
                    `INSERT INTO links (shortcode,name) VALUES(?,?)`,
                    [
                        shortcode,
                        shortcode
                    ])
                    .catch(e=>{throw e}) as any;
    
                Link = {id:insertLinkResult.insertId,isActive:1};

            }

            return Link;

        } catch(e) {

            throw e;

        }

    }

    public async setItem(data:any,link:{id:number,isActive:number,source:number}) {

        const shortcode = data.link.match(/([a-z0-9|-]+\.)*[a-z0-9|-]+\.[a-z]+/gm)
        console.log(shortcode[0].replace('www.',''));

        const [isUnique] = await DB.query(`
                SELECT n.id 
                FROM news AS n 
                WHERE n.title = ?`,
            [data.title]) as any;

        if(isUnique.length > 0 ) {
            console.log(`duplicate item`);
            return;
        }

        let pubDate;
        if(data.pubDate) pubDate = (new Date(data.pubDate)).getTime();
        if(data.published) pubDate = (new Date(data.published)).getTime();
        if(data["a10:updated"]) pubDate = (new Date(data.published)).getTime();
        if(!pubDate) pubDate = (new Date()).getTime();
        
        const res = await DB.query(`INSERT INTO news (linkId,sourceId,shortId,title,url,createdAt,publishedAt) VALUES (?,?,?,?,?,?,?)`,[
            link.id,
            link.source,
            (nanoid(6) + "." + data.title.replace(/ /gm,"-")).slice(0,32),
            data.title,
            data.link,
            (new Date()).getTime(),
            pubDate
        ]).catch(e=>console.log(e));

        return res;

    }

}