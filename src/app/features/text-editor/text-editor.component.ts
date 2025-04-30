import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { QuillModule } from 'ngx-quill'
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, MatIconModule, MatTooltipModule, MatIconButton, MatButtonModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.css'
})
export class TextEditorComponent {
  @Input() content: string = ''
  @Output() contentChange = new EventEmitter<string>()
  @Output() editorBlurred = new EventEmitter<void>();

  onEditorBlur() {
    this.contentChange.emit(this.content);
    this.editorBlurred.emit(); // <-- explizit auslösen!
  }

  modules = {
    toolbar: '#custom-toolbar',
  };
}
