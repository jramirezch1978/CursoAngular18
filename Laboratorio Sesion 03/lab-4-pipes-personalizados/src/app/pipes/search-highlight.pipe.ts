import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'searchHighlight',
  standalone: true,
  pure: true
})
export class SearchHighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(
    text: string, 
    search: string, 
    className: string = 'highlight',
    caseSensitive: boolean = false
  ): SafeHtml {
    if (!text || !search) {
      return text;
    }

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${this.escapeRegex(search)})`, flags);
    
    const highlightedText = text.replace(regex, 
      `<span class="${className}">$1</span>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}