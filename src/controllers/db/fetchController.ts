import fetchDB from '../../service/fetchDB'

const fetchController = async (req: any, res: any) => {
    try {
        let { login, id, table } = req.query
        id = parseInt(id, 10)
        const result = await fetchDB({
            login,
            table,
            id,
        })
        res.status(200).json({ message: 'fetch-200', data: { result } })
    } catch (error: any) {
        console.error(error?.message || error)
        res.status(500).json({ message: 'fetch-error-500' })
    }
}

export default fetchController
