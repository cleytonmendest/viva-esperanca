// src/components/ui/multi-select.tsx

"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/libs/utils" // Seu utilitário de classes do shadcn
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export type OptionType = {
    label: string
    value: string
}

interface MultiSelectProps {
    options: OptionType[]
    selected: string[] | null
    onChange: React.Dispatch<React.SetStateAction<string[]>>
    className?: string
    placeholder?: string
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
    ({ options, selected, onChange, className, placeholder = "Selecione as opções..." }, ref) => {
        const [open, setOpen] = React.useState(false)

        const handleUnselect = (item: string) => {
            onChange(selected ? selected.filter((i) => i !== item) : [])
        }

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open} // Fix: Ensure selected is not null before accessing length
                        className={cn("w-full justify-between", selected && selected.length > 0 ? "h-full" : "h-10")} 
                        onClick={() => setOpen(!open)}
                    >
                        <div className="flex gap-1 flex-wrap">
                            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
                            {selected.map((item) => {
                                const optionLabel = options.find(o => o.value === item)?.label || item;
                                return (
                                    <Badge
                                        variant="secondary"
                                        key={item}
                                        className="mr-1 mb-1"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que o Popover feche ao clicar no Badge
                                            handleUnselect(item)
                                        }}
                                    >
                                        {optionLabel}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(item)
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onClick={() => handleUnselect(item)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command className={className}>
                        <CommandInput placeholder="Pesquisar..." />
                        <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                        <CommandList>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            onChange(
                                                selected.includes(option.value)
                                                    ? (selected ? selected.filter((item) => item !== option.value) : [])
                                                    : (selected ? [...selected, option.value] : [option.value])
                                            )
                                            setOpen(true)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selected.includes(option.value)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }