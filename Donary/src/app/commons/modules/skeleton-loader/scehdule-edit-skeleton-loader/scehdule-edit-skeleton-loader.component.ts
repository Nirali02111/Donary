import { Component, Input } from '@angular/core';
import { SkeletonLoaderModule } from '../skeleton-loader.module';

@Component({
  selector: 'app-scehdule-edit-skeleton-loader',
  standalone: true,
  imports: [SkeletonLoaderModule],
  templateUrl: './scehdule-edit-skeleton-loader.component.html',
  styleUrl: './scehdule-edit-skeleton-loader.component.scss'
})
export class ScehduleEditSkeletonLoaderComponent {
  @Input()isLoader = true;
  @Input() theme1: { [k: string]: string } = { width: '150px', height: '35px' }
  @Input() theme2: { [k: string]: string } = { width: '290px', height: '35px' }
}
