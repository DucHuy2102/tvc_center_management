import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
    {
        variants: {
            variant: {
                default: 'bg-[#E7EDFB] text-[#1E40AF]',
                success: 'bg-[#E6F3EA] text-[#2F7D4F]',
                warning: 'bg-[#FBF0DC] text-[#A86A0B]',
                danger: 'bg-[#FBE8E5] text-[#B3382C]',
                neutral: 'bg-[#ECEFF5] text-[#5A6478]',
                brass: 'bg-[#F8F4EB] text-[#9A7B3F]',
                outline: 'border border-border text-foreground bg-white',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
