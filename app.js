import express from 'express';
import chalk from 'chalk';
import debugLibrary from 'debug';
import morgan from 'morgan';
import fetch from 'node-fetch';
import url from 'url';

const app = express();
const debug = debugLibrary('app');
const PORT = process.env.PORT || 3000;
app.use(morgan('tiny'));

app.get('/api/items', async (req, res) => {
    const productQuery = url.parse(req.url, true).query.q;
    const rawProductsFetch = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=:${productQuery}`);
    const rawProducts = await rawProductsFetch.json();
    const rawCategories = rawProducts.available_filters.find((filter) => filter.id === 'category').values;
    let mostImportantCategory = {results: 0};
    rawCategories.forEach((category) => {
        if (category.results > mostImportantCategory.results) {
            mostImportantCategory = category;
        }
    });

    const breadcrumCategoriesFetch = await fetch(`https://api.mercadolibre.com/categories/${mostImportantCategory.id}`);
    const breadcrumRawCategories = await breadcrumCategoriesFetch.json();
    const breadcrumCategories = breadcrumRawCategories.path_from_root.map((category) => category.name);
    const products = rawProducts.results.map((product) => {
        const simpleProduct = {
            "id": product.id,
            "title": product.title,
            "price": {
                "currency": product.currency_id,
                "amount": product.price,
                "decimals": 0
            },
            "picture": product.thumbnail,
            "condition": product.condition,
            "free_shipping": product.shipping.free_shipping
        };

        return simpleProduct;
    });

    const processedProducts = {
        "author": {
            "name": "Juan Jose",
            "lastname": "Andrade Pardo"
        },
        "categories": breadcrumCategories,
        "items": products
    };
    debug("Products: ", processedProducts);
    res.send(processedProducts);
});

app.get('/api/items/:id/', async (req, res) => {
    const productId = req.params['id'];
    const rawProductFetch = await fetch(`https://api.mercadolibre.com/items/${productId}`);
    const rawProductDescriptionFetch = await fetch(`https://api.mercadolibre.com/items/${productId}/description`);
    const rawProduct = await rawProductFetch.json();
    const productDescription = await rawProductDescriptionFetch.json();
    const product = {
        "author": {
            "name": "Juan Jose",
            "lastname": "Andrade Pardo"
        },
        "item": {
            "id": rawProduct.id,
            "title": rawProduct.title,
            "price": {
                "currency": rawProduct.currency_id,
                "amount": rawProduct.price,
                "decimals": 0
            },
            "picture": rawProduct.pictures[0].url,
            "condition": rawProduct.condition,
            "free_shipping": rawProduct.shipping.free_shipping,
            "sold_quantity": rawProduct.sold_quantity,
            "description": productDescription.plain_text
        }
    };

    debug("Product: ",product);
    res.send(product);
});

app.listen(PORT, () => {
    debug(`listening on port ${chalk.green(PORT)}`);
});
