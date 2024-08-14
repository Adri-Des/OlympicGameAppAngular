import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OlympicCountryParticipation } from 'src/app/core/models/Participation';

@Component({
  selector: 'app-details',
  //standalone:true,
  //imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit, OnDestroy {
  /**
   * The name of the selected country, obtained from the route parameters.
   */
  public country: string | null = '';
  /**
   * Observable holding the list of Olympic countries.
   */
  public olympics$: Observable<OlympicCountry[]> = of([]);
  /**
   * The Olympic country that was selected based on the route parameter.
   */
  public selectedCountry: OlympicCountry | undefined;

  /**
   * Subscription to handle the observable data stream.
   */
  private detailSubscription: Subscription | undefined;

  /**
   * Constructor that injects required services: OlympicService for data handling,
   * ActivatedRoute for accessing route parameters, and Router for navigation.
   * @param olympicService Service used to fetch Olympic data.
   * @param route ActivatedRoute to access route parameters.
   * @param router Router to handle navigation.
   */
  constructor(
    private olympicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Angular method that is called after the component's view has been initialized.
   * It retrieves the selected country's name from the route and subscribes to the Olympic data.
   * If the selected country is found, it creates the Olympic details chart.
   */
  ngOnInit(): void {
    this.country = this.route.snapshot.paramMap.get('countryselect');

    this.olympics$ = this.olympicService.getOlympics();
    this.detailSubscription = this.olympics$.subscribe(
      (countries: OlympicCountry[]) => {
        this.selectedCountry = countries.find(
          (country) => country.country === this.country
        );
        if (this.selectedCountry) {
          this.createOlympicDetailsChart(this.selectedCountry.participations);
        }
      }
    );

    console.log(this.country);
  }

  /**
   * Angular method that is called when the component is destroyed.
   * It unsubscribes from the observable .
   */
  ngOnDestroy(): void {
    if (this.detailSubscription) {
      this.detailSubscription.unsubscribe();
    }
  }

  /**
   * Creates a detailed line chart for the selected country's Olympic participation data.
   * It uses the Chart.js library to render the chart in a canvas element.
   * @param participations Array of the selected country's Olympic participations.
   */
  createOlympicDetailsChart(
    participations: OlympicCountryParticipation[]
  ): void {
    //Get the number of athletes for each participation for the selected country
    const { athletes } =
      this.olympicService.getNumberOfAthletes(participations);

    //Get the total number of athletes for the selected country
    const totalAthletes = athletes.reduce(
      (total, athletes) => total + athletes
    );

    //Get the years of participations for the selected country
    const { years } = this.olympicService.getYears(participations);

    //Get the number of medals for each participation for the selected country
    const { medals } = this.olympicService.getMedalsPerCountry(participations);

    //Get the total number of medals for the selected country
    const { totalMedals } = this.olympicService.getTotalMedals(medals);

    //Get the number of participation for the selected country
    const nbEntries = participations.length;

    // Get the chart's canvas element
    const chart = document.getElementById(
      'OlympicCountryDetailsChart'
    ) as HTMLCanvasElement;

    // If a chart already exists on the canvas, destroy it before creating a new one.
    if (Chart.getChart(chart)) {
      Chart.getChart(chart)?.destroy();
    }

    // Determine the color for the chart based on the selected country
    let colorCountry: string;

    switch (this.country) {
      case 'Italy':
        colorCountry = ' #895044';
        break;
      case 'United States':
        colorCountry = ' #618dcd ';
        break;
      case 'Germany':
        colorCountry = ' #78191f ';
        break;
      case 'France':
        colorCountry = ' #9c80b6 ';
        break;
      case 'Spain':
        colorCountry = ' #9bc3dc ';
        break;
      //case 'UK':
      //return ' #a6dbeb';
      default:
        colorCountry = ' #f2f3f4 ';
    }

    // Create a new line chart
    new Chart(chart, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Medals',
            data: medals,
            backgroundColor: 'black',
            borderColor: colorCountry,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          title: {
            display: false,
            text: this.country!,
            font: {
              size: 50,
            },
          },
        },
      },
    });

    // Update the HTML elements with the selected country's details.
    const countryName = document.getElementById('countryName');
    if (countryName) {
      countryName.innerHTML = `${this.country}`;
    }
    const showNbEntries = document.getElementById('numberOfEntries');
    if (showNbEntries) {
      showNbEntries.innerHTML = `Number of entries <br> <strong>${nbEntries}<\strong>`;
    }

    const showNbmedals = document.getElementById('numberOfMedals');
    if (showNbmedals) {
      showNbmedals.innerHTML = `Total number medals <br> <strong>${totalMedals}<\strong>`;
    }

    const showNbathlete = document.getElementById('numberOfAthletes');
    if (showNbathlete) {
      showNbathlete.innerHTML = `Total number of athletes <br> <strong>${totalAthletes}<\strong>`;
    }
  }

  /**
   * Navigates back to the home page when the "Retour" button is clicked.
   */
  onRetour() {
    this.router.navigate(['']);
  }
}
