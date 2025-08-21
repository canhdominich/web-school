export interface Header {
    key: string;
    title: string;
}

export interface RowData {
    id: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export interface BasicTableProps {
    headers: Header[];
    items: RowData[];
}
export interface Team {
    images: string[];
}

export interface User {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    userRoles: Array<{
        id: string;
        userId: string;
        roleId: string;
        createdAt: string;
        updatedAt: string;
        role: {
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
        };
    }>;
}

export interface Faculty {
    id: number;
    code: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    id: number;
    code: string;
    name: string;
    description?: string;
    facultyId: number;
    faculty?: Faculty;
    createdAt: string;
    updatedAt: string;
}

export interface Major {
    id: number;
    code: string;
    name: string;
    description?: string;
    departmentId: number;
    department?: Department;
    createdAt: string;
    updatedAt: string;
}

export interface TermMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    termId: string;
    orderIndex: number;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
    term?: {
        id: string;
        name: string;
    };
    status: TermMilestoneStatus;
}

export type TermStatus = 'open' | 'closed' | 'archived';

export interface Term {
    id: number;
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: TermStatus;
    termMilestones: TermMilestone[];
    createdAt: string;
    updatedAt: string;
}

export type TermMilestoneStatus = 'active' | 'inactive';