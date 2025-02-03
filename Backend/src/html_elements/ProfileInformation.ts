import { User } from "../types";
import { HtmlElement } from "./HtmlElement";

export class ProfileInformation extends HtmlElement {
	private user: User;

	constructor(user: User) {
		super();
		this.user = user;
	}

	public override getHtml(): string {
		return `
		<main class="container mt-5">
			<div class="row justify-content-center">
				<div class="col-md-8">
					<!-- Profile Header -->
					<div class="d-flex align-items-center mb-4">
						<div>
							<h1 class="h2 mb-0">${this.user.VORNAME} ${this.user.NACHNAME}</h1>
							<p class="text-muted">Geboren: ${this.user.GEBURTSDATUM.getDate().toString().padStart(2,'0')}.${(this.user.GEBURTSDATUM.getMonth()+1).toString().padStart(2,'0')}.${this.user.GEBURTSDATUM.getFullYear()}</p>
						</div>
					</div>

					<!-- Profile Card -->
					<div class="card shadow-sm">
						<div class="card-header">
							<h2 class="h5 mb-0">Profilinformationen</h2>
						</div>
						<div class="card-body">
							<div class="row">
								<div class="col-md-6">
									<dl class="mb-0">
										<dt>Vorname</dt>
										<dd class="mb-3">${this.user.VORNAME}</dd>
										
										<dt>Nachname</dt>
										<dd class="mb-3">${this.user.NACHNAME}</dd>
										
										<dt>Telefon</dt>
										<dd class="mb-3">${this.user.TELEFON}</dd>
									</dl>
								</div>
								<div class="col-md-6">
									<dl class="mb-0">
										<dt>E-Mail</dt>
										<dd class="mb-3">${this.user.EMAIL}</dd>
										
										<dt>Adresse</dt>
										<dd class="mb-0">
											${this.user.STRASSE} ${this.user.HAUSNR}<br>
											${this.user.PLZ} ${this.user.ORT}<br>
											Deutschland
										</dd>
									</dl>
								</div>
							</div>
						</div>
						<div class="card-footer text-end">
							<a href="/edit-profile" class="btn btn-primary">
								<i class="bi bi-pencil-fill me-2"></i>
								Profil bearbeiten
							</a>
						</div>
					</div>
				</div>
			</div>
		</main>`
	}
}
