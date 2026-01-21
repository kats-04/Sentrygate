/**
 * Auditor Read-Only Middleware
 * Blocks all write operations (POST, PUT, PATCH, DELETE) for Auditor role
 */
export const blockAuditorWrites = (req, res, next) => {
    if (req.user?.role === 'Auditor' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
            error: 'Auditors have read-only access',
            message: 'Your role does not permit modifications to the system'
        });
    }
    next();
};
