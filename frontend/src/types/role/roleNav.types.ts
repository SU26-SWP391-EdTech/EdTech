export type Role =
    | 'learner'
    | 'admin'
    | 'provider'
    | 'academic-manager'
    | 'guest';

export interface RoleMeta {
    label: string;
    color: string;
    bg: string;
    desc: string;
}