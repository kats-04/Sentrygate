import LoginHistory from '../models/LoginHistory.js';
import { io } from '../index.js';

/**
 * SecurityMonitor - DevSecOps Threat Detection Engine
 * Analyzes security events and emits real-time alerts
 */
class SecurityMonitor {
    constructor() {
        this.BRUTE_FORCE_THRESHOLD = 5;
        this.BRUTE_FORCE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
    }

    /**
     * Analyze login attempt for brute force patterns
     */
    async analyzeLoginAttempt(ip /* , success, userId = null */) {
        try {
            const twoMinsAgo = new Date(Date.now() - this.BRUTE_FORCE_WINDOW_MS);

            const recentFailures = await LoginHistory.countDocuments({
                ipAddress: ip,
                success: false,
                createdAt: { $gte: twoMinsAgo }
            });

            if (recentFailures >= this.BRUTE_FORCE_THRESHOLD) {
                await this.emitAlert('critical', 'brute_force', {
                    ip,
                    failureCount: recentFailures,
                    message: `🚨 BRUTE FORCE DETECTED: ${recentFailures} failed login attempts from ${ip}`
                });
                return { isHighRisk: true, severity: 'critical', alertType: 'brute_force' };
            }

            return { isHighRisk: false, severity: 'low' };
        } catch (err) {
            console.error('Error analyzing login attempt:', err);
            return { isHighRisk: false, severity: 'low' };
        }
    }

    /**
     * Detect privilege escalation (role change to Admin)
     */
    async detectPrivilegeEscalation(actorId, targetId, newRole) {
        if (newRole === 'Admin') {
            await this.emitAlert('high', 'privilege_escalation', {
                actorId,
                targetId,
                newRole,
                message: `⚠️ PRIVILEGE ESCALATION: User ${targetId} elevated to Admin by ${actorId}`
            });
            return { isHighRisk: true, severity: 'high', alertType: 'privilege_escalation' };
        }
        return { isHighRisk: false, severity: 'low' };
    }

    /**
     * Monitor sensitive actions (account suspension, admin deletion)
     */
    async checkSensitiveAction(action, targetUserId, targetRole) {
        if (action === 'account_suspended' || (action === 'user_deleted' && targetRole === 'Admin')) {
            const severity = targetRole === 'Admin' ? 'critical' : 'high';
            await this.emitAlert(severity, 'sensitive_action', {
                action,
                targetUserId,
                targetRole,
                message: `🚨 SENSITIVE ACTION: ${action} on ${targetRole} account`
            });
            return { isHighRisk: true, severity };
        }
        return { isHighRisk: false, severity: 'low' };
    }

    /**
     * Emit real-time alert to all Admin users via Socket.IO
     */
    // eslint-disable-next-line class-methods-use-this
    async emitAlert(severity, type, details) {
        try {
            const alert = {
                severity,
                type,
                timestamp: new Date(),
                ...details
            };

            // Broadcast to all connected Admin users
            io.to('admins').emit('security:alert', alert);

            console.log(`[SecurityMonitor] Alert emitted: ${severity.toUpperCase()} - ${type}`, details);
        } catch (err) {
            console.error('Error emitting alert:', err);
        }
    }
}

export default new SecurityMonitor();
