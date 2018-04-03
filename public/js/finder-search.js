$(function(){
	$('.eventName').each((key, val)=>{
		if($(val).text().toLowerCase() === 'test'){
			$($('.event')[key]).remove()
		}
	})

	//filtre show/mask
	function titleUpDown(options, filter){
		$(options).toggle().removeClass('hidde')
		$(filter).toggleClass('fa-chevron-down')
		$(filter).toggleClass('fa-chevron-up')
	}

	function selected(mois, discipline) {
		$('.moisOption').removeClass('badge-primary').addClass('badge-secondary')
		mois.removeClass('badge-secondary').addClass('badge-primary')
		$('.disciplineOption').removeClass('badge-primary').addClass('badge-secondary')
		discipline.removeClass('badge-secondary').addClass('badge-primary')
	}
	 
	//city search
	function cityInit(){
		$('input[name=lieuFilter]').val("")
	}
	function citySearch() {
		selected($(".mois.all"), $(".discipline.all"))
	    var filter = $('input[name=lieuFilter]').val().toUpperCase(),
	    index = $('.index'),
	    city = $('.city');

	    for ( var i = 0; i < city.length; i++) {
	        var a = city[i].textContent;
	        if (a.toUpperCase().indexOf(filter) === -1) {
	            index[i].classList.add("hidde")
	        } else {
	        	index[i].classList.remove("hidde")
	        }
	    }
	}

	var searchStart = ()=>{
		$('<p id="loading">Chargement en cours, merci pour votre patience</p>').insertBefore('#events')
		$('#events').addClass('hidde')
	}
	var searchEnd = ()=>{
		$('#events').removeClass('hidde')
		$('#loading').remove()
	}

	function filterInit(){

		//index init
		var eventElement = $('.index')

		//filter init
		for(var i = 0 ; i < eventElement.length; i++){
			$(eventElement[i]).addClass("hidde")
		}
	}

	/////////////////////// FILTERS TRIGGERS \\\\\\\\\\\\\\\\\\\\\\

	//FILTRE SHOW/MASK
	// filtre par discipline Show/Mask
	$('#moisFilter').on('click', function(){
		titleUpDown("#moisOptions","#moisFilter > i")
	})
	$('#disciplineFilter').on('click', function(){
		titleUpDown("#disciplineOptions", "#disciplineFilter > i")
	})
	$('#cityForm').on('click', function(){
		titleUpDown("#cityFilter", "#cityForm > i")
	})

	//DISCIPLINE
	$(document).on('click', '.disciplineOption', function(){
		var disciplineElement = $(this).text().toLowerCase()
		//console.log(disciplineElement)

		//menu
		cityInit()
		filterInit()
		selected($(".mois.all"), $(this))

		//Affichage d'une catégorie spécifique
		for(var i = 0 ; i < $('.discipline').contents().length; i++) {
			if( $($('.discipline').contents()[i]).text().toLowerCase() === disciplineElement ){
				$($($('.discipline')[i]).parents().get(5)).removeClass('hidde')
			}
		}
		
		//Affichage de toutes les catégories
		if(disciplineElement === $('.disciplineOption.all').text().toLowerCase()){
			for(var i = 0 ; i < $('.discipline').contents().length; i++){
				$($($('.discipline')[i]).parents().get(5)).removeClass('hidde')
			}
		}
	})

	//CITY
	$(document).on('keyup', 'input[name=lieuFilter]', function(){
		citySearch()
	})

	//MOIS
	$(document).on('click', '.moisOption', function(){
		var moisElement = $($(this).children()[0]).val() * 1
		//console.log(moisElement)

		//menu
		cityInit()
		filterInit()
		selected($(this), $(".discipline.all"))
		
		//Affichage d'un mois spécifique
		for(var i = 0 ; i < $('input[name=filtre-mois]').length; i++) {
			if( $($('input[name=filtre-mois]')[i]).val() * 1 === moisElement *1 ){
				//console.log("OK")
				$($($('input[name=filtre-mois]')[i]).parents().get(3)).removeClass('hidde')
			}
		}
		
		//Affichage de tous les mois
		if(moisElement === 0){
			for(var i = 0 ; i < $('.discipline').contents().length; i++){
				$($($('.discipline')[i]).parents().get(5)).removeClass('hidde')
			}
		}
	})

	$('#inscription-ouverte').on('click',()=>{
		cityInit()
		filterInit()

		if($('#checkbox-inscriptions-open').is(':checked') === false){
			$('input#checkbox-inscriptions-open')[0].checked = true
			$('.fa-check').removeClass('hidde')
			$('.fa-times').addClass('hidde')

			//init filter
			$('.index').each((key,val)=>{
				if($($($('.event-source')[key]).children().get(0)).hasClass('event-disable') === false){
					$(val).removeClass('hidde')
				}
			})
		} else {
			$('input#checkbox-inscriptions-open')[0].checked = false
			$('.fa-check').addClass('hidde')
			$('.fa-times').removeClass('hidde')

			$('.index').removeClass('hidde')
		}
	})
})

