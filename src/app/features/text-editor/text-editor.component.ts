import {Component, Input, Output, EventEmitter, forwardRef, ViewEncapsulation} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import Quill from 'quill';

/*const Font = Quill.import('formats/font') as any;
Font.whitelist = ['arial', 'roboto', 'times-new-roman', 'courier-new', 'comic-sans'];
Quill.register(Font, true);*/

@Component({
  selector: 'app-text-editor',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true
    }
  ]
})
export class TextEditorComponent implements ControlValueAccessor {
  private _content = '';

  @Input()
  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
    this.onChange(value);
    this.contentChange.emit(value);
  }

  @Output() contentChange = new EventEmitter<string>();
  @Output() editorBlurred = new EventEmitter<void>();

  modules = {
    toolbar: '#custom-toolbar',
  };

  // ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this._content = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onEditorBlur(): void {
    this.onTouched();
    this.editorBlurred.emit();
  }
}
