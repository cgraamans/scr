import { App } from "index";

import DB from "../services/db"
import { FieldPacket, QueryResult } from "mysql2";



/* 

Function: run routines to link text to location

Inserts:

- text with i18n textblocks per news item
- countries referenced in text per news item

I18n textblock format:

[[countrycode,cityId,adjectivalId,personId,,,],original_textblock]

*/

export default class i18nDB {

    constructor(){}

    private mergeArray = (a:any[], b:any[], predicate = (a:any[], b:any[]) => a === b) => {
        const c = [...a]; // copy to avoid side effects
        // add all items from B to copy C if they're not already present
        b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
        return c;
    }

    // Sanitize regExp
    private sanitizeRegExp = (s:string) => {
        return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    }

    // GET
    public async get(lim:number = 10) {

        try {

            return await DB.query(`
                    SELECT * from news AS n 
                    LEFT JOIN news_procs np ON np.newsId = n.id 
                    WHERE np.newsId IS NULL
                    OR np.i18n IS NULL         
                    ORDER BY n.id DESC 
                    LIMIT ?`
                ,[lim]
            ).catch(e=>console.log(e));

        } catch(e) {

            console.log("!i18nModelGet",e);
            return;

        }

    }

    // SET AS PROCESSED
    public async setProc(newsId:number,dir:number = 1) {

        const [isProc] = await DB.query(`SELECT newsId FROM news_procs WHERE newsId = ?`,[newsId]) as any;
        if(isProc && isProc.length > 0) {
            console.log("ISPROC",isProc);
            return await DB.query(`UPDATE news_procs SET i18n = ? WHERE newsId = ?`,[
                dir,
                newsId
            ]);
        }
        return await DB.query(`INSERT INTO news_procs (newsId,i18n) VALUES (?,?)`,[
            newsId,
            dir
        ]);

    }

    /*


    !!!! TO DO !!!!

        tags!!!!H


    */


    public async putTags(tags:string[]) {

        // let returnTagIds:number[] = [];

        // for await (const tag of tags) {

        //     const [isTag]:any = await DB.query(`
        //             SELECT id
        //             FROM tags
        //             WHERE tag = ?
        //         `,[]);

        //     if(isTag.length > 0) {
        //         returnTagIds.push(isTag[0].id);
        //         return;
        //     }

        //     const [insertResult] = await DB.query(`INSERT INTO tags SET ?`,[
        //         {
        //             name:tag,

        //         }
        //     ])

        // }

    }


    // Countries
    public async getTagsFromText(text:string,resultObj:{original?:string,modified?:string,tagIds:number[]} = {tagIds:[]}) :Promise<{original?:string,modified?:string,tagIds:number[]}> {

        if(!resultObj.original) resultObj.original = text;
        if(!resultObj.modified) resultObj.modified = text;

        let sql = `
            SELECT id, tag, countryId, cityId, capitalId, orgId, pplId
            FROM tags
            WHERE BINARY ? LIKE CONCAT('%', tag, '%')
            ORDER by LENGTH(tag) DESC;
        `;

        const [tags]:any = await DB.query(sql,[resultObj.modified])
            .catch(e=>console.log(e));

        if(tags.length > 0) {

            tags.forEach((tagObj:any) =>{

                tagObj.tag = this.sanitizeRegExp(tagObj.tag);
                resultObj.modified = resultObj.modified.replace(new RegExp(tagObj.tag, 'g'), `[TAG:${tagObj.id}]`);

                resultObj.tagIds.push(tagObj.id);

            });

        }

        return resultObj;

    }

    public async putNewsTags(tags:{newsId:number,tagId:number}[]) {

        return await DB.query(`
                INSERT INTO news_tags
                SET ?
            `,tags);

    }

    //
    // Main Processing
    //
    public async put(newsItem:any) {

        try {

            // lock news item
            await DB.query(
                `
                    INSERT INTO news_procs 
                    SET ?
                `,
                [
                    {
                        newsId:newsItem.id,
                        i18n:1,
                    }
                ]
            );

            let countryCodes:string[] = [];
            let text = newsItem.title;

            // people

            // const countries = await this.getCountriesFromText({text:text});
            // if(countries.ccodes.length > 0) {
            //     countryCodes = this.mergeArray(countryCodes,countries.ccodes);
            //     text = countries.text;
            // }

            // const capitals = await this.getCapitalsFromText({text:text});
            // if(capitals.ccodes.length > 0) {
            //     countryCodes = this.mergeArray(countryCodes,capitals.ccodes);
            //     text = capitals.text;
            // }

            // const adjectivals = await this.getCountryAdjectivalsFromText({text:text});
            // if(adjectivals.ccodes.length > 0) {
            //     countryCodes = this.mergeArray(countryCodes,adjectivals.ccodes);
            //     text = adjectivals.text;
            // }

            console.log('TITLE',newsItem.title);
            console.log('PROCESSED TEXT',text)

            console.log(countryCodes);

            if(countryCodes && countryCodes.length > 0) {

                await Promise.all(countryCodes.map(async entry=>{

                    // SET news_i18ns
                    await DB.query(
                        `
                            INSERT INTO news_i18ns 
                            SET ?
                        `,
                        [
                            {
                                newsId:newsItem.id,
                                countrycode:entry,
                                createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                                updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
                            }
                        ]
                    );
                    // console.log(entry);

                    return;

                }));

                console.log('-----');

            }
            // // const persons = await this.getPersonalitiesFromText(newsItem.title);

            return;


        } catch(e) {

            console.log("!i18nModelProc",e);
            return;

        }

    }

    // private async getCitiesFromText(textobj:{text:string}){

         

    // }

    // private async getCountryAdjectivalsFromText(textobj:{text:string,ccodes?:string[]}) :Promise<{text:string,ccodes?:string[]}> {

    //     if(!textobj.ccodes) textobj.ccodes = [];

    //     let sql = `

    //         SELECT dca.id, dc.countrycode, dca.adj 
    //             FROM data_adjectivals AS dca
    //             INNER JOIN data_countries AS dc ON dc.id = dca.countryId
    //                 WHERE  (
    //                     ? LIKE BINARY CONCAT('%',dca.adj,'%')
    //                     OR 
    //                     ? LIKE BINARY CONCAT('%',dca.adj)
    //                     OR 
    //                     ? LIKE BINARY CONCAT(dca.adj,'%')
    //                 )
    //                 AND (
    //                     ? NOT LIKE BINARY CONCAT('%],',dca.adj,']%')
    //                     OR 
    //                     ? NOT LIKE BINARY CONCAT('%],',dca.adj,']')
    //                 )
    //     `;

    //     const [countries]:any = await DB.query(sql,[
    //             textobj.text,
    //             textobj.text,
    //             textobj.text,
    //             textobj.text,
    //             textobj.text,
    //         ])
    //         .catch(e=>console.log(e));

    //     if(countries.length > 0) {

    //         textobj.ccodes.push(countries[0].countrycode);
    //         textobj.text = textobj.text.replace(countries[0].name,`[[${countries[0].countrycode},,${countries[0].id}],${countries[0].adjectival}]`);

    //         return await this.getCountryAdjectivalsFromText({text:textobj.text,ccodes:textobj.ccodes});
            
    //     } else {

    //         return {text:textobj.text,ccodes:textobj.ccodes};
        
    //     }

    // }

    // private parameterize(text:string,obj:{countrycode:string,cityId:string|null,adjectivalId?:string|null,pplId?:string|null}) {



    // }


    // Capitals
    public async getCapitalsFromText(text:string,resultObj:{original?:string,modified?:string,countries:string[]} = {countries:[]}) :Promise<{original?:string,modified?:string,countries:string[]}> {

        if(!resultObj.original) resultObj.original = text;
        if(!resultObj.modified) resultObj.modified = text;

        const modifSplit = resultObj.modified
                            .replace(/[\.\,\"\`\:\;\-\?\\\/\<\>]|\'s|\'ll|\'/gm,"")
                            .split(" ")
                            .join("','");

        let sql = `
            SELECT dc.id, dc.name, c.countryCode
            FROM data_capitals AS dc
            INNER JOIN data_countries c ON c.countrycode = dc.countrycode
            WHERE dc.name IN ('${modifSplit}')
            AND LENGTH(dc.name) > 3;
        `;

        const [capitals]:any = await DB.query(sql,[])
            .catch(e=>console.log(e));

        if(capitals.length > 0) {

            capitals.forEach((capital:any) =>{
                capital.name = capital.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                resultObj.modified = resultObj.modified.replace(new RegExp(capital.name, 'g'), `[CAPITAL:${capital.id}]`);
                resultObj.countries.push(capital.countryCode);
            });

        }

        return resultObj;

    }

    private async getPeopleFromText(text:string){}

}