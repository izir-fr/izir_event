import "jquery";

import cart from './cart';

$( () => {
	if($('#inscription_cart').length !== 0){

		let epreuveQt = 0

		//CART START
		let cart =() => {
		//event subtotal
			for(var i = 0 ; i < $('.quantityInput').length; i++) {
				//calcul subtotal
				var subtotal = ($('input[name=tarif]')[i].value*1) * ($('.quantity')[i].value*1)
				$('.subtotalView')[i].textContent = subtotal
				$('input[name=subtotal]')[i].value = subtotal
			}

			//total
			var totalData = []
			var tarif = 0
			for(var i = 0; i < $('input[name=subtotal]').length; i++){
				totalData.push($('input[name=subtotal]')[i].value*1)
			}
			for (var i = 0; i < totalData.length; i++) {
				tarif += totalData[i]
			}
			$('#totalview')[0].innerHTML = tarif
			$('input[name=total]').val(tarif)
		}

		let totalEpreuve =() => {
			var totalEpreuveQt = []
			for(var i = 0; i < $('.epreuveInput').length; i++){
				totalEpreuveQt.push($('.epreuveInput')[i].value*1)
			}
			for (var i = 0; i < totalEpreuveQt.length; i++) {
				epreuveQt += totalEpreuveQt[i]
			}
			//console.log(epreuveQt)
		}
		
		$(document).ready( () => {
		 	totalEpreuve()
		 	cart()
		} )
		$('.input').on("change keyup click", (e) => {
			totalEpreuve()
			cart()
		})

		//Minimum 1 inscription pour toutes les épreuves
		$('#cart').on('click', (e) => {
			if(epreuveQt === 0 || epreuveQt === null || epreuveQt === undifinied){
				e.preventDefault()
				alert('Vous devez vous inscrire à une épreuve minimum')
			}
		})
	}	// cart end				
})