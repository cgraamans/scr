import DB from "../services/db"
import {App} from '../../types/index'

export default class MetaDataDB {

    constructor(){}

    public async getNews(limit:number = 3) {

        return await DB.query(`
                SELECT n.id, n.url 
                FROM news AS n 
                LEFT JOIN news_procs np ON n.id = np.newsId 
                WHERE np.newsId IS NULL 
                OR np.metadata IS NULL 
                ORDER BY publishedAt DESC
                LIMIT ?;
            `,[limit]);

    }

    public async setMetaData(newsId:number,image:string|null = null,description:string|null = null) {

        return await DB.query(
            `INSERT INTO news_meta (newsId,image,description) VALUES (?,?,?)`,
            [
                newsId,
                image,
                description
            ]
        );

    }

    public async setProc(newsId:number,dir:number = 1) {

        const [isProc] = await DB.query(`SELECT newsId FROM news_procs WHERE newsId = ?`,[newsId]) as any;
        if(isProc && isProc.length > 0) {
            return await DB.query(`UPDATE news_procs SET metadata = ? WHERE newsId = ?`,[
                dir,
                newsId
            ]);
        }
        return await DB.query(`INSERT INTO news_procs (newsId,metadata) VALUES (?,?)`,[
            newsId,
            dir
        ]);

    }

}