import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
export const fetchCart = createAsyncThunk('cart/fetch', async(__dirname, {rejectWithValue})=>{
    try {
        return await api.get('/api/cart');
    } catch(err) {
        return rejectWithValue(err.message);
    }
})

export const addToCart = createAsyncThunk('cart/add', async (productId, {rejectedWithValue}) => {
   try {
    return await api.post('/api/cart/add', {productId, quantity:1})
   } catch (err) {
    return rejectedWithValue(err.message)
   }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
        return await api.put(`/api/cart/${itemId}`, { quantity });
    } catch (err) {
        return rejectWithValue(err.message);
    }
});
 
export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, {rejectWithValue}) => {
    try {
        await api.delete(`/api/cart/${itemId}`)
        return itemId
    } catch (err) {
        return rejectWithValue(err.message)
    }
})

export const clearCartApi = createAsyncThunk('cart/clear', async (__, {rejectWithValue}) =>{
   try {
    await api.delete('/api/cart');
   } catch(err) {
    return rejectWithValue(err.message)
   } 
}) 

const cartSlice = createSlice({
    name:'cart',
    initialState : {
        items:[],
        total: 0,
        itemCount : 0,
        loading : false,
        error : null,
    },
    reducers: {
        clearCart : (state) => {
            state.items = [];
            state.total = 0;
            state.itemCount = 0;
        }
    },
    extraReducers : (builder) => {
            builder
            //fetch cart
            .addCase(fetchCart.pending, (state) => {state.loading = true; state.error = null;})
            .addCase(fetchCart.fulfilled, (state, action)=>{
                state.loading = false;
                state.items = action.payload.cartItems || [];
                state.total = action.payload.total || 0;
                state.itemCount = action.payload.itemCount || 0;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload
            })
            // add to cart 
            .addCase(addToCart.pending, (state) => {state.error = null;})
            .addCase(addToCart.fulfilled, (state, action)=>{
                const newItem = action.payload.cartItem;
                const existing = state.items.findIndex(i=>i.id === newItem.id)
                if(existing >= 0) {
                    state.items[existing] = newItem;
                } else {
                    state.items.push(newItem);
                    state.itemCount += 1;
                }
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.error = action.payload
            })
            //update cart Item
            .addCase(updateCartItem.fulfilled, (state, action) =>{
                const updated = action.payload.cartItem;
                const idx = state.items.findIndex(i => i.id === updated.id);
                if(idx >= 0) state.items[idx] = updated
            })

            // Remove Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = state.items.filter(i => i.id !== action.payload);
                state.itemCount = state.items.length;
            })
            //clear cart api
            .addCase(clearCartApi.fulfilled, (state) => {
                state.items = [];
                state.total = 0;
                state.itemCount = 0;
            })
        } 
    })

export const { clearCart } = cartSlice.actions;
export const selectCartItems   = (state) => state.cart.items;
export const selectCartCount   = (state) => state.cart.itemCount;
export const selectCartTotal   = (state) => state.cart.total;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError   = (state) => state.cart.error;

export default cartSlice.reducer;