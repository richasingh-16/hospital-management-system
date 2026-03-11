import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    const authHeader = req.headers.authorization

    if (!authHeader) {
        res.status(401).json({ error: "Token missing" })
        return
    }

    const token = authHeader.split(" ")[1]

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        )

            ; (req as any).user = decoded

        next()

    } catch {
        res.status(403).json({ error: "Invalid token" })
        return
    }
}