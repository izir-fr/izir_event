module.exports = function Cart (oldCart){
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.add = (item, id)=>{
		var storedItem = this.items[id]
		if(!storedItem){
			storedItem = this.items[id] = {item: item, qty: 0, price: 0}
		}
		storedItem.qty++
		storedItem.price = storedItem.item.price * storedItem.qty
		this.totalQty++
		this.totalPrice += storedItem.item.price
	}

	this.reduceByOne = (id)=>{
		this.items[id].qty--
		this.items[id].price -= this.items[id].item.price
		this.totalQty--
		this.totalPrice -= this.items[id].item.price

		if(this.items[id].qty <= 0){
			delete this.items[id]
		}
	}

	this.increaseByOne = (id)=>{
		this.items[id].qty++
		this.items[id].price += this.items[id].item.price
		this.totalQty++
		this.totalPrice += this.items[id].item.price

		if(this.items[id].qty <= 0){
			delete this.items[id]
		}
	}

	this.reduceByX = (id, qtyX)=>{
		if( qtyX >= this.items[id].qty ) {
			var qty = this.items[id].qty
			this.items[id].qty -= qty
			this.items[id].price -= this.items[id].item.price * qty
			this.totalQty -= qty
			this.totalPrice -= this.items[id].item.price * qty			
		} else {
			this.items[id].qty -= qtyX
			this.items[id].price -= this.items[id].item.price * qtyX
			this.totalQty -= qtyX
			this.totalPrice -= this.items[id].item.price * qtyX	
		}

		if( this.items[id].qty <= 0 ){
			delete this.items[id]
		}
	}

	this.increaseByX = (id, qtyX)=>{
		this.items[id].qty += qtyX
		this.items[id].price += this.items[id].item.price * qtyX
		this.totalQty += qtyX
		this.totalPrice += this.items[id].item.price * qtyX
	}

	this.removeItem = (id)=>{
		this.totalQty -= this.items[id].qty
		this.totalPrice -= this.items[id].price
		delete this.items[id]
	}

	this.generateArray = ()=>{
		var arr = []
		for(var id in this.items){
			arr.push(this.items[id])
		}
		return arr
	}
}