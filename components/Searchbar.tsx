import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Searchbar = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [inputValue, setInputValue] = React.useState(value || "")

        React.useEffect(() => {
            if (value !== undefined) {
                setInputValue(value as string)
            }
        }, [value])


        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value)
            if (onChange) {
                onChange(e)
            }
        }


        const handleClear = () => {
            setInputValue("")

            if (onChange) {
                const event = {
                    target: { value: "" }
                } as React.ChangeEvent<HTMLInputElement>
                onChange(event)
            }
        }


        const hasText = inputValue.toString().length > 0

        return (
            <div className="relative bg-background">

                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>

                <input
                    type='text'
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-purple-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "pl-10",
                        hasText ? "pr-10" : "",
                        className
                    )}
                    ref={ref}
                    value={inputValue}
                    onChange={handleInputChange}
                    {...props}
                />


                {hasText && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        )
    }
)
Searchbar.displayName = "Searchbar"

export { Searchbar }