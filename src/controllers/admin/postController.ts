import createDB from '../../service/createDB'

const postController = async (req: any, res: any) => {
    try {
        const { login, password } = req.query

        if (typeof login !== 'string' || typeof password !== 'string') {
            return res
                .status(500)
                .json({ message: 'postAdmin-password-or-login-not-string-500' })
        }

        const result = await createDB({ login, password })

        if (!result) {
            return res.status(500).json({
                message: `неправильные значения`,
            })
        }
        return res.status(200).json({
            result,
        })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ message: 'postadmin-500' })
    }
}

export default postController