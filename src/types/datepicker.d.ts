
declare module '@/components/ui/date-picker' {
  import { ReactNode } from 'react';

  export interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
  }

  export interface DateRangePickerProps {
    dateRange: { from: Date | undefined; to: Date | undefined };
    setDateRange: (dateRange: { from: Date | undefined; to: Date | undefined }) => void;
  }

  export const DatePicker: React.FC<DatePickerProps>;
  export const DatePickerWithRange: React.FC<DateRangePickerProps>;
}
