import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
/**
 * Create a Proxy Configuration File.
Create a file named proxy.conf.json (or any other name, but this is a common convention) in the root of your Angular project.

Modify the start script in your package.json to include the --proxy-config flag.
 */
@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  input = 'happy baby';
  response='';

  constructor(){
    if (environment.debugMode) {
      console.log('Running in debug mode');
    }
    const apiEndpoint = environment.apiUrl + '/users';
    console.log(apiEndpoint)
    console.log(environment.API_KEY)
  }
  process(){
    console.log(this.input);
    fetch('/api', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: this.input })
                }).then(res => res.json())
                    .then(res => {
                        const resp = res[0].label === 'POSITIVE' ? 'Pushing P!' : 'Negative vibesdetected';
                        this.response = resp;
                        
                    })
  }
}
