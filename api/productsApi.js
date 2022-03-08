import express from 'express';
import url from 'url';
import productsService from '../services/ProductsService.js';

export default function shoppingApi(debug) {
    let router = express.Router();

    router.get('/items', async (req, res) => {
        const productQuery = url.parse(req.url, true).query.q;
        const processedProducts = await productsService.getProcessedProducts(productQuery);
        debug("Products: ", processedProducts);
        res.send(processedProducts);
    });

    router.get('/items/:id/', async (req, res) => {
        const productId = req.params['id'];
        const product = await productsService.getProcessedProduct(productId);
        debug("Product: ",product);
        res.send(product);
    });

    return router;
}