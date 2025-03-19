import { ResultSetHeader } from "mysql2";

export namespace App {

    export namespace RSS {

        interface itemId extends ResultSetHeader {
            id:number;
        }

        interface source {
            id:number;
            link:string;
        }
        
        interface item {

            title:string;
            link:string;
            pubDate:string;
            description?:string;
            content?:string;
            contentSnippet?:string;
        
        }

    
    }

}

