import {useEffect, useState} from "react";
import axios from "axios";

function usePublish(type) {
    const {users: {username}} = JSON.parse(localStorage.getItem("token"))
    const [dataSource, setDataSource] = useState([])
    useEffect(() => {
        axios.get(`/news?author=${username}&publishState=${type}`).then(res => {
            setDataSource(res.data)
        })
    }, [username, type]);
    return {dataSource,setDataSource}
}

export default usePublish