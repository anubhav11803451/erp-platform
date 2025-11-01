import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { type DayPickerProps } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Calendar } from './calendar';
import { TimePicker } from './time-picker';

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours';

// ---------- utils end ----------

type Granularity = 'day' | 'hour' | 'minute' | 'second';

type DateTimePickerProps = {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    disabled?: boolean;
    /** showing `AM/PM` or not. */
    hourCycle?: 12 | 24;
    placeholder?: string;

    /**
     * The format is derived from the `date-fns` documentation.
     * @reference https://date-fns.org/v3.6.0/docs/format
     **/
    displayFormat?: { hour24?: string; hour12?: string };
    /**
     * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
     * By default, the value is `second` which shows all time inputs.
     **/
    granularity?: Granularity;
    className?: string;
    /**
     * Show the default month and time when popup the calendar. Default is the current Date().
     **/
    defaultPopupValue?: Date;
    /**
     * Enable live timer functionality - updates automatically based on current time
     */
    liveTimer?: boolean;
    /**
     * Live timer update interval in milliseconds (default: 1000ms for seconds)
     */
    liveTimerInterval?: number;
} & Pick<DayPickerProps, 'locale' | 'weekStartsOn' | 'showWeekNumber' | 'showOutsideDays'>;

type DateTimePickerRef = {
    value?: Date;
} & Omit<HTMLButtonElement, 'value'>;

const DateTimePicker = React.forwardRef<Partial<DateTimePickerRef>, DateTimePickerProps>(
    (
        {
            locale = enUS,
            defaultPopupValue = new Date(Date.now() + 2 * 60 * 1000),
            value,
            onChange,
            hourCycle = 24,
            disabled = false,
            displayFormat,
            granularity = 'second',
            placeholder = 'Pick a date',
            className,
            liveTimer = false,
            liveTimerInterval = 1000,
            ...props
        },
        ref
    ) => {
        const buttonRef = React.useRef<HTMLButtonElement>(null);
        const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
        const onChangeRef = React.useRef<typeof onChange>(null);
        const [isOpen, setIsOpen] = React.useState(false);

        const getInitialDate = React.useCallback(() => {
            if (value && isValid(value)) return value;
            return new Date(Date.now() + 2 * 60 * 1000);
        }, [value]);

        const [date, setDate] = React.useState<Date>(getInitialDate);

        const lastUserSetDateRef = React.useRef<Date>(getInitialDate());
        const startTimestampRef = React.useRef<number>(Date.now());

        React.useEffect(() => {
            onChangeRef.current = onChange;
        }, [onChange]);

        React.useEffect(() => {
            if (value && isValid(value)) {
                setDate(value);
                lastUserSetDateRef.current = value;
                startTimestampRef.current = Date.now();
            }
        }, [value]);

        // Live ticking
        React.useEffect(() => {
            if (!liveTimer) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }

            intervalRef.current = setInterval(() => {
                const elapsedMs = Date.now() - startTimestampRef.current;
                const liveDate = new Date(lastUserSetDateRef.current.getTime() + elapsedMs);
                setDate(liveDate);
                onChangeRef.current?.(liveDate);
            }, liveTimerInterval);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }, [liveTimer, liveTimerInterval]);

        // Format setup
        const formatStrings = {
            hour24: displayFormat?.hour24 ?? `PPP HH:mm${granularity === 'second' ? ':ss' : ''}`,
            hour12: displayFormat?.hour12 ?? `PP hh:mm${granularity === 'second' ? ':ss' : ''} b`,
        };

        // const loc = locale ?? enUS;

        const handleDateSelect = (newDate?: Date) => {
            if (!newDate) return;

            const updated = new Date(newDate);
            updated.setHours(
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            );

            lastUserSetDateRef.current = updated;
            startTimestampRef.current = Date.now();

            setDate(updated);
            onChange?.(updated);
        };

        const handleTimeChange = (newDate?: Date) => {
            if (!newDate) return;

            lastUserSetDateRef.current = newDate;
            startTimestampRef.current = Date.now();

            setDate(newDate);
            onChange?.(newDate);
        };

        React.useImperativeHandle(
            ref,
            () => ({
                ...buttonRef.current,
                value: date,
            }),
            [date]
        );

        return (
            <Popover
                open={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open);
                }}
            >
                <PopoverTrigger asChild disabled={disabled}>
                    <Button
                        className={cn(
                            'justify-center rounded-md !bg-transparent !py-3 !text-xs',
                            !date && 'text-muted-foreground',
                            className
                        )}
                        ref={buttonRef}
                    >
                        <CalendarIcon className="mr-2 size-4" />
                        {date ? (
                            <span className="flex items-center gap-1">
                                {format(
                                    date,
                                    hourCycle === 24 ? formatStrings.hour24 : formatStrings.hour12
                                )}
                            </span>
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        fromDate={defaultPopupValue}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={locale}
                        {...props}
                    />
                    {granularity !== 'day' && (
                        <div className="border-border border-t p-3">
                            <TimePicker
                                onChange={handleTimeChange}
                                date={date}
                                hourCycle={hourCycle}
                                granularity={granularity}
                            />
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        );
    }
);

DateTimePicker.displayName = 'DateTimePicker';
export { DateTimePicker };

export type { TimePickerType, DateTimePickerProps, DateTimePickerRef };
