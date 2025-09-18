import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  imports: [CommonModule],
  template: ` <video #videoElement autoplay playsinline muted class="video-element"></video>
    <canvas #canvasElement class="overlay-canvas"></canvas>
    <p #gestureOutputElement class="output">
      @if (!isRunning()) {
        <div class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Initializing camera and hand tracking...</p>
        </div>
      }
    </p>`,
  styleUrls: ['./camera.scss'],
})
export class Camera implements AfterViewInit {
  private readonly videoElementRef =
    viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  private readonly canvasElementRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');

  readonly isRunning = input<boolean>();
  readonly onElementReady = output<{
    videoElement: HTMLVideoElement;
    canvasElement: HTMLCanvasElement;
  }>();

  ngAfterViewInit() {
    this.onElementReady.emit({
      videoElement: this.videoElementRef()?.nativeElement,
      canvasElement: this.canvasElementRef()?.nativeElement,
    });
  }
}
