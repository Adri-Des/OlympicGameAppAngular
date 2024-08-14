import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';
import { OlympicCountryParticipation } from '../models/Participation';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  /**
   * URL of the JSON file containing Olympic data.
   */
  private olympicUrl = './assets/mock/olympic.json';

  /**
   * BehaviorSubject to store and emit the Olympic data.
   * Initialized with an empty array of OlympicCountry.
   */
  private olympics$ = new BehaviorSubject<OlympicCountry[]>([]);

  /**
   * Constructor injecting HttpClient for making HTTP requests.
   */

  constructor(private http: HttpClient) {}

  /**
   * Loads the initial data from the JSON file and updates the olympics$ observable.
   * @returns Observable with loaded data
   */
  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next([]);
        return caught;
      })
    );
  }

  /**
   * Returns the observable containing the Olympic data.
   * @returns Observable emitting the interface OlympicCountry's data.
   */
  getOlympics() {
    return this.olympics$.asObservable();
  }

  /**
   * Extracts the names of countries .
   * @param countries Interface with Olympic data.
   * @returns Array of country names.
   */
  getCountriesNames(countries: OlympicCountry[]): {
    countryNames: string[];
  } {
    const countryNames = countries.map((country) => country.country);
    return { countryNames };
  }

  /**
   * Extracts the years of participation .
   * @param participations Interface with a list of a country's participations in the Olympic Games.
   * @returns Array of participation years.
   */
  getYears(participations: OlympicCountryParticipation[]): {
    years: number[];
  } {
    const years = participations.map((participation) => participation.year);
    return { years };
  }

  /**
   * Extracts the number of medals won per country.
   * @param participations Interface with a list of a country's participations in the Olympic Games.
   * @returns Array of the number of medals per country's participation.
   */
  getMedalsPerCountry(participations: OlympicCountryParticipation[]): {
    medals: number[];
  } {
    const medals = participations.map(
      (participation) => participation.medalsCount
    );
    return { medals };
  }

  /**
   * Calculates the total number of medals from a country.
   * @param medals Array containing the number of medals for each participation.
   * @returns An object containing the total number of medals.
   */
  getTotalMedals(medals: number[]): {
    totalMedals: number;
  } {
    const totalMedals = medals.reduce((total, medal) => total + medal);
    return { totalMedals };
  }

  /**
   * Extracts the number of athletes who participated per country.
   * @param participations Interface with a list of a country's participations in the Olympic Games.
   * @returns Array of the number of athletes per participation.
   */
  getNumberOfAthletes(participations: OlympicCountryParticipation[]): {
    athletes: number[];
  } {
    const athletes = participations.map(
      (participation) => participation.athleteCount
    );

    return { athletes };
  }
}
