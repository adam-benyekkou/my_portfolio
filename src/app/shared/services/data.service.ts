import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Project } from '../models/project.model';
import { firstValueFrom } from 'rxjs';
import { type NeuralProfileNode } from '../models/about.model';
import { type Experience } from '../models/experience.model';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly loadingService = inject(LoadingService);

  // Private signals for state management
  private _projects = signal<Project[]>([]);
  private _skills = signal<NeuralProfileNode[]>([]);
  private _educations = signal<Experience[]>([]);
  private _experiences = signal<Experience[]>([]);
  private _traits = signal<string[]>([]);

  // Public readonly signals
  readonly projects = this._projects.asReadonly();
  readonly skills = this._skills.asReadonly();
  readonly educations = this._educations.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly traits = this._traits.asReadonly();


  async loadProjects(): Promise<void> {
    if (this._projects().length > 0) return;
    this.loadingService.start();
    const data = await this.fetchProjects();
    this._projects.set(data);
    this.loadingService.stop();
  }

  async loadSkills(): Promise<void> {
    if (this._skills().length > 0) return;
    this.loadingService.start();
    const data = await this.fetchSkills();
    this._skills.set(data);
    this.loadingService.stop();
  }

  async loadEducations(): Promise<void> {
    if (this._educations().length > 0) return;
    this.loadingService.start();
    const data = await this.fetchEducations();
    this._educations.set(data);
    this.loadingService.stop();
  }

  async loadExperiences(): Promise<void> {
    if (this._experiences().length > 0) return;
    this.loadingService.start();
    const data = await this.fetchExperiences();
    this._experiences.set(data);
    this.loadingService.stop();
  }

  async loadTraits(): Promise<void> {
    if (this._traits().length > 0) return;
    this.loadingService.start();
    const data = await this.fetchTraits();
    this._traits.set(data);
    this.loadingService.stop();
  }

  private async fetchProjects(): Promise<Project[]> {
    try {
      return await firstValueFrom(
        this.http.get<Project[]>(`data/projects.json?v=${new Date().getTime()}`),
      );
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  private async fetchSkills(): Promise<NeuralProfileNode[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<NeuralProfileNode>(`data/skilltree.json?v=${new Date().getTime()}`),
      );
      console.log('Fetched skills:', result);
      return [result];
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  private async fetchEducations(): Promise<Experience[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<Experience>(`data/education.json?v=${new Date().getTime()}`),
      );
      console.log('Fetched education:', result);
      return [result];
    } catch (error) {
      console.error('Error fetching education:', error);
      return [];
    }
  }

  private async fetchExperiences(): Promise<Experience[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<Experience[]>(`data/experiences.json?v=${new Date().getTime()}`),
      );
      console.log('Fetched experiences:', result);
      return result;
    } catch (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }
  }

  private async fetchTraits(): Promise<string[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<string[]>(`data/traits.json?v=${new Date().getTime()}`),
      );
      console.log('Fetched traits:', result);
      return result;
    } catch (error) {
      console.error('Error fetching traits:', error);
      return [];
    }
  }
}
