import express from 'express';
import url from 'url';
import productsService from '../services/ProductsService.js';

export default function shoppingApi(debug) {
    let router = express.Router();

    router.get('/items', async (req, res) => {
        try {
            const productQuery = url.parse(req.url, true).query.q;
            const processedProducts = await productsService.getProcessedProducts(productQuery);
            debug("Products: ", processedProducts);
            res.status(200).send(processedProducts);
        } catch {
            res.status(500).json({ 
                error: {
                    message: 'Server Error'
                }
            });
        }

    });

    router.get('/items/:id/', async (req, res) => {
        try {
            const productId = req.params['id'];
            const product = await productsService.getProcessedProduct(productId);
            debug("Product: ",product);
            res.status(200).send(product);
        } catch {
            res.status(500).json({ 
                error: {
                    message: 'Server Error'
                }
            });
        }
    });

    return router;
}