import DB from "../services/db";
import {T} from "../../types/index";

export const getItems = async (params:T.Params.Items) => {

    // assemble query
    return await DB.query("SELECT * FROM news WHERE dt < ? ",[params.dt])

}