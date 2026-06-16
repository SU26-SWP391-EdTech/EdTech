import React from 'react';
import { Circle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export interface StatusStyle {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    desc: string;
}

export const STATUS_CFG: Record<'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED', StatusStyle> = {
    DRAFT: {
        label: 'Draft',
        color: '#4B5563', // gray-600
        bg: '#F3F4F6',    // gray-100
        border: '#E5E7EB', // gray-200
        icon: <Circle className="w-3.5 h-3.5" />,
        desc: 'Work in progress'
    },
    PENDING: {
        label: 'Pending',
        color: '#D97706', // amber-600
        bg: '#FEF3C7',    // amber-100
        border: '#FDE68A', // amber-200
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        desc: 'Awaiting review'
    },
    APPROVED: {
        label: 'Approved',
        color: '#16A34A', // green-600
        bg: '#DCFCE7',    // green-100
        border: '#BBF7D0', // green-200
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        desc: 'Live on platform'
    },
    REJECTED: {
        label: 'Rejected',
        color: '#DC2626', // red-600
        bg: '#FEE2E2',    // red-100
        border: '#FCA5A5', // red-200
        icon: <XCircle className="w-3.5 h-3.5" />,
        desc: 'Needs revision'
    }
};
