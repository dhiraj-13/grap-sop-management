import { Component, EventEmitter, Input, Output, HostListener, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() disabled: boolean = false;
  @Input() id: string = '';
  @Input() ariaLabel: string = '';
  @Input() width: string = '100%';
  @Input() maxHeight: string = '240px';
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  
  @Output() selectionChange = new EventEmitter<any>();
  @Output() openedChange = new EventEmitter<boolean>();

  isOpen = false;
  isFocused = false;
  searchTerm = '';
  filteredOptions: DropdownOption[] = [];
  highlightedIndex = -1;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnDestroy() {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  @HostListener('document:keydown.arrow-down', ['$event'])
  onArrowDown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.isOpen && !this.disabled) {
      keyboardEvent.preventDefault();
      this.open();
    }
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.highlightedIndex = -1;
    this.searchTerm = '';
    this.filteredOptions = [...this.options];
    this.openedChange.emit(true);
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.highlightedIndex = -1;
      this.onTouched();
      this.openedChange.emit(false);
    }
  }

  selectOption(option: DropdownOption) {
    if (option.disabled) return;
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.close();
  }

  clearSelection(event: MouseEvent) {
    event.stopPropagation();
    this.onChange(null);
    this.selectionChange.emit(null);
    this.close();
  }

  filterOptions() {
    if (!this.searchTerm) {
      this.filteredOptions = [...this.options];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOptions = this.options.filter(opt => 
        opt.label.toLowerCase().includes(term)
      );
    }
    this.highlightedIndex = -1;
  }

  getSelectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : this.placeholder;
  }

  // ControlValueAccessor implementation
  value: any = null;

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
