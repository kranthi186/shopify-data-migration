import express from "express"
import ProductError from "../schema/ProductError"
import mongoose from "mongoose"
import { MongoClient } from 'mongodb'
require('dotenv').config()

const mongoUrl = 'mongodb://localhost:27017'
const dbName = 'display4sale'

// Initialize variables for specifications tab
const specialSectionTitleList = [
	'General Info',
	'Dimensions',
	'Frame Info',
	'Matboard Info',
	'Post Info',
	'Banner Stand Specifications',
	'Cork Board Specifications',
	'Dry / Wet Erase Board Specifications',
	'Letter Board Specifications',
	'Chalk Board Specifications',
	'Easy-Tack Specifications',
	'Menu Specifications',
	'Multi-Panel / Art Bin Specifications'
]
const filterNameList = [
	[
		'Application Type', 'Brand', 'Carrying Case', 'Display Type', 'Features', 'Finishes', 'Header', 
		'Hinge Location', 'Lighting', 'Literature (Brochure) Holders', 'Maximum Wind Resistance', 'Multi-Tiered', 
		'Number of Advertisements to Display', 'Number of Doors', 'Number of Sides', 'Orientation', 'Placement Type', 
		'Security Feature', 'Shelf Type', 'Telescopic Display', 'WeatherPlus Add-ons'
	],
	[
		'Interior Depth', 'Maximum Insert Thickness', 'Overall Depth', 'Overall Height', 'Sizes', 'Newspaper Size', 'Menu Size'
	],
	[
		'Corner Style', 'Frame Shape', 'Frame Style', 'Frame Type', 'Frame Width'
	],
	[
		'Decorative Mat Border Included', 'Matboard Width'
	],
	[
		'Base Style', 'Base Width'
	],
	[
		'Banner Mounting Method', 'Banner Width', 'Number of Banners to Display', 'Purchase an Optional Banner'
	],
	[
		'Fabric Over Cork', 'Forbo Cork Board Color', 'Painted Cork Colors', 'Vinyl Over Cork'
	],
	[
		'Dry / Wet Erase Boards', 'Dry Erase Board Material'
	],
	[
		'Letter / Character Set Type', 'Letter / Character Size', 'Letter / Character Style', 'Letter / Reader Set Color', 
		'Letter Tracks', 'Letterboard Color', 'Letterboard Material'
	],
	[
		'Chalk Board Color', 'Chalk Board Type'
	],
	[
		'Easy-Tack Fabric'
	],
	[
		'Menu Orientation', 'Number of Menus to Display'
	],
	[
		'Art Bin Displaying Method', 'Art Bin Tray Levels', 'Number of Panels', 'Print Protector Backing Board', 
		'Print Protector Border Color', 'Print Protector BorderType', 'Print Protector Overlay', 'Number of Rolled Posters'
	]
]


const router = express.Router()
const Shopify = require('shopify-api-node')
const shopify = new Shopify({
	shopName: process.env.shop_name,
	apiKey: process.env.shop_api_key,
	password: process.env.shop_api_password,
	timeout: 50000,
	autoLimit: {
		calls: 2,
		interval: 1000,
		bucketSize: 35
	}
})
async function asyncForEach1(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
async function asyncForEach2(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
async function asyncForEach3(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
async function asyncForEach4(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
router.get("/", (req, res, next) => {
	res.status(200).json({
		message:"Serving Products on the Endpoint."
	})
})

router.get("/list", (req, res, next) => {
	Product.find({})
		.exec()
		.then(docs => {
			console.log('product list: ', docs)
		})
		.catch(err => {
			console.log(err)
		})
})

router.get('/updateDBProducts', async (req, res, next) => {
	res.render('home')
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	await productCollection.updateMany(
		{ SiteID: 1 },
		{ $set: {
			shopifyProductId: 0, 
			shopifyFirstOptionId: 0, 
			shopifyFirstVariantId: 0,
			updatedOnline: 0,
			template_id: 0,
			productAttributeCategories: null
		} }
	)
	console.log('update end')
	
})

router.get('/deleteAllProducts', async (req, res, next) => {
	res.render('home')
	const productcount = await shopify.product.count()
	const pages = Math.ceil(productcount / 15)
	for (var i = 0; i < pages; i++) {
		const productList = await shopify.product.list({
			limit: 15,
			page: i + 1,
			fields: 'id, title'
		})
		productList.map(pr => {
			shopify.product.delete(pr.id)
		})
		console.log(i + ' of ' + pages)
	}
	res.render('home')
})

/*
router.get('/prepare1', async (req, res, next) => {
	const csvFilePath1 = './csv/Products - Copy.csv'
	const readStream=require('fs').createReadStream(csvFilePath1)
	readStream
	.pipe(parse({ columns: ['ProductID', 'SiteID', 'ModelName', 'HTMLIntro', 'SubDesc', 'ListPrice', 'OurPrice', 
														'DemoPrice', 'Image1', 'Image2', 'PDF1', 'PDF2', 'SpecSheet', 'Stocked', 'Created', 
														'Active', 'Weight', 'Length', 'Width', 'Freight', 'ShipPrice', 'FreeGround', 'DropShipID', 
														'Related_Products', 'Image3', 'Image4', 'SwatchHeader', 'SwatchHeader3', 'SwatchHeader4'], 
								delimiter: "\t", skip_empty_lines: true, relax_column_count: true, quote: "'", skip_lines_with_error: true }))
	.on('data', (csvrow) => {
		// console.log(csvrow)
		var productData = new CsvProduct()
		productData.title = csvrow.ModelName
		productData.csvProductId = csvrow.ProductID
		productData.csvSiteId = parseInt(csvrow.SiteID)
		productData.price = parseFloat(csvrow.DemoPrice)
		productData.image1 = csvrow.Image1 ? csvrow.Image1 : ''
		productData.image2 = csvrow.Image2 ? csvrow.Image2 : ''
		productData.image3 = csvrow.Image3 ? csvrow.Image3 : ''
		productData.image4 = csvrow.Image4 ? csvrow.Image4 : ''
		productData.pdf1 = csvrow.PDF1 ? csvrow.PDF1 : ''
		productData.pdf2 = csvrow.PDF2 ? csvrow.PDF2 : ''
		var relatedProducts = csvrow.Related_Products
		if (relatedProducts && relatedProducts.length > 0) {
				productData.related_products = relatedProducts.split(',')
		} else {
				productData.related_products = []
		}
		productData.active = parseInt(csvrow.Active)
		productData.save()
	})
	
	console.log('end')
	res.render('home')
})
*/

router.get('/importSpecialOptions', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productSpecialTitlesCollection = mydb.collection('product-special-titles')
	const { GoogleSpreadsheet } = require('google-spreadsheet')
	const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)
	doc.useApiKey(process.env.GOOGLE_API_KEY)
	
	await doc.loadInfo()
	const sheet = doc.sheetsByIndex[1]
	const rows = await sheet.getRows()
	asyncForEach1(rows, async (optionRow) => {
		// const sectionTitles = optionRow._rawData.split(',')
		const rowData = {
			Section3Title: optionRow._rawData[0] ? optionRow._rawData[0] : '',
			Section4Title: optionRow._rawData[1] ? optionRow._rawData[1] : '',
			Section5Title: optionRow._rawData[2] ? optionRow._rawData[2] : ''
		}
		await productSpecialTitlesCollection.insert(rowData)

	})
	
})

router.get('/testmeta', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')

	const productIdList = [
		'tlbs', 
		'sfc', 
		'SBMW-SHELF8-2024', 
		'scm-1117p', 'lscl', 'CBOECL-5050', 
		'TTR855', 'abmc', 'TKM514', 
		'SBMWIDE4-LED', 'LOREADHDH-2S-7248', 
		'sfwlbhl', 'fdg', 'sswf'
	]

	const productList = await productCollection.find({SiteID: 1, ProductID: {$in: productIdList}})
	productList.forEach(async (productItem) => {
		shopify.metafield
			.list({
				metafield: { owner_resource: 'product', owner_id: productItem.shopifyProductId }
			})
			.then(
				(metafields) => {
					metafields.map(mf => {
						if (mf.key == 'shipping_summary' && mf.namespace == 'shipping') {
							console.log('----', productItem.ProductID, mf)
						}
					})
				},
				(err) => console.error(err)
			);
	})

	res.render('home')
})

router.get('/createTestProduct', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const subcatCollection = mydb.collection('productsubcat')
	const seoCollection = mydb.collection('productseo')
	const productImageCollection = mydb.collection('productimages')
	const dropShippingCollection = mydb.collection('dropshipping')
	const productfilterchoicesCollection = mydb.collection('productfilterchoices')
	const filtersCollection = mydb.collection('filters')
	const productquantityCollection = mydb.collection('productquantities')
	const productswatchCollection = mydb.collection('productswatches')
	const productswatchCollection3 = mydb.collection('productswatches3')
	const productswatchCollection4 = mydb.collection('productswatches4')
	const productmattesCollection = mydb.collection('productmattes')
	const productSpecialTitlesCollection = mydb.collection('product-special-titles')
	const chartRowCollection = mydb.collection('chartrows')
	const chartColumnCollection = mydb.collection('chartcolumns')
	const chartValueCollection = mydb.collection('chartvalues')

	// Indexing collections
	productImageCollection.createIndex({ ProductID: 1, SiteID: 1 })
	subcatCollection.createIndex({ ProductID: 1, SiteID: 1 })
	seoCollection.createIndex({ ProductID: 1, SiteID: 1 })
	dropShippingCollection.createIndex({ DropShipID: 1 })
	productfilterchoicesCollection.createIndex({ product_id: 1 })
	filtersCollection.createIndex({ filter_id: 1 })
	productquantityCollection.createIndex({ ProductID: 1, SiteID: 1 })
	
	// getting special section title list
	let sectionTitleList1 = []
	let sectionTitleList2 = []
	let sectionTitleList3 = []
	const specialTitleList = await productSpecialTitlesCollection.find({})
	specialTitleList.forEach(specialTitleItem => {
		if (specialTitleItem.Section3Title != '') {
			sectionTitleList1.push(specialTitleItem.Section3Title)
		}
		if (specialTitleItem.Section4Title != '') {
			sectionTitleList2.push(specialTitleItem.Section4Title)
		}
		if (specialTitleItem.Section5Title != '') {
			sectionTitleList3.push(specialTitleItem.Section5Title)
		}
	})
	const productIdList = [
		'tlbs',
		'sfc', 
		'SBMW-SHELF8-2024', 
		'scm-1117p', 'lscl', 'CBOECL-5050', 
		'TTR855', 'abmc', 'TKM514', 
		'SBMWIDE4-LED', 'LOREADHDH-2S-7248', 
		'sfwlbhl', 'fdg', 'sswf'
	]

	const productList = await productCollection.find({SiteID: 1, ProductID: {$in: productIdList}})
	// const productList = await productCollection.find({SiteID: 1})
	productList.forEach(async (productItem) => {
		const productTitle = productItem.ModelName
		const productSKU = productItem.ProductID
		const productBodyHtml = productItem.FullDesc
		// get title of subCategory
		const subCat = await subcatCollection.aggregate([
			{
				$match:
				{
					'ProductID': productItem.ProductID,
					'SiteID': 1
				}
			},
			{
				$lookup:
				{
					from: "subcategories",
					localField: "SubCatID",
					foreignField: "SubCatID",
					as: "subcategoryDetail"
				}
			}
		]).toArray()

		const productType = subCat[0] ? subCat[0].subcategoryDetail[0].Title : 'cannotfind'
		// get current time
		let date_ob = new Date()
		const currentTimestamp = date_ob.getFullYear() + "-" + 
													("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" +
													("0" + date_ob.getDate()).slice(-2) + "T" +
													("0" + date_ob.getHours()).slice(-2) + ":" +
													("0" + date_ob.getMinutes()).slice(-2) + ":" +
													("0" + date_ob.getSeconds()).slice(-2)
		
		const publishedAt = productItem.Active ? currentTimestamp : null

		// get first tags
		const seoDetail = await seoCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()

		const firstTags = seoDetail[0].MetaKeywords
		const metafieldsGlobalTitleTag = seoDetail[0].PageTitle
		const metafieldsGlobalDescriptionTag = seoDetail[0].MetaDesc
		// get dropshipping
		const dropShipping = await dropShippingCollection.find({DropShipID: productItem.DropShipID}).toArray()
		const vendorName = dropShipping[0].Name

		// get filters and filterchoices
		const filterChoiceList = await productfilterchoicesCollection.aggregate([
			{
				$match:
				{
					'product_id': productItem.ProductID
				}
			},
			{
				$lookup:
				{
					from: "filterchoices",
					localField: "filter_choice_id",
					foreignField: "filter_choice_id",
					as: "filterchoiceDetail"
				}
			}
		]).toArray()

		let secondTags = ''

		await asyncForEach1(filterChoiceList, async (filterchoiceItem) => {
			if (filterchoiceItem.filterchoiceDetail[0]) {
				const filterchoiceDetail = filterchoiceItem.filterchoiceDetail[0]
				const filterDetail = await filtersCollection.find({filter_id: filterchoiceDetail.filter_id}).toArray()
				const filterString = filterDetail[0].name + ':' + filterchoiceDetail.name
				if (secondTags == '') {
					secondTags += filterString
				} else {
					secondTags += ',' + filterString
				}
			}
		})

		const secondTagsWithComma = firstTags == '' ? secondTags : ',' + secondTags

		let thirdTag = productItem.FreeGround ? 'free-ground' : ''
		thirdTag = (firstTags == '' && secondTags == '') ? thirdTag : (thirdTag == '' ? '' : ',' + thirdTag)

		const tagString = firstTags + secondTagsWithComma + thirdTag

		// ----------------end of product fields-----------------------

		// ---------------start of product images----------------------
		const productImageList = await productImageCollection.find({
			ProductID: productItem.ProductID,
			SiteID: 1
		}).toArray()
		let productImageName = productItem.Image1.split('.')
		productImageName = productImageName[0]
		let imagePosition = 0
		let images = []
		if (productItem.Image1 != '') {
			imagePosition ++
			images.push({
				position: imagePosition,
				src: 'https://displays4sale.com/i/p1/' + productItem.Image1,
				alt: seoDetail[0].Image1Alt
			})
		}
		if (productItem.Image2 != '') {
			imagePosition ++
			images.push({
				position: imagePosition,
				src: 'https://displays4sale.com/i/p2/' + productItem.Image2,
				alt: seoDetail[0].Image2Alt
			})
		}
		if (productItem.Image3 != '') {
			imagePosition ++
			images.push({
				position: imagePosition,
				src: 'https://displays4sale.com/i/p3/' + productItem.Image3,
				alt: seoDetail[0].Image3Alt
			})
		}
		if (productItem.Image4 != '') {
			imagePosition ++
			images.push({
				position: imagePosition,
				src: 'https://displays4sale.com/i/p4/' + productItem.Image4,
				alt: seoDetail[0].Image4Alt
			})
		}

		productImageList.map(pi => {
			imagePosition ++
			images.push({
				position: imagePosition,
				src: 'https://displays4sale.com/i/pl/' + productImageName + '-' + pi.ImageID + '.jpg',
				alt: seoDetail[0].Image1Alt
			})
		})

		console.log('-----------------', productItem.ProductID, '--------------')
		console.log('images: ', images)
		
		// ----------------end of product images-----------------------

		// ---------------start of product custom fields----------------------

		let meta_qty_discounts = ''
		const quantityList = await productquantityCollection.find({
			ProductID: productItem.ProductID,
			SiteID: 1
		}).toArray()
		await asyncForEach1(quantityList, async (quantityItem) => {
			const qty_discount = 'QTY ' + quantityItem.QuantityFrom + '-' + quantityItem.QuantityTo + ',' +
														quantityItem.PercentOff + '%, ' + quantityItem.LeadTimeShip + '\n'
			meta_qty_discounts += qty_discount
		})
		meta_qty_discounts = meta_qty_discounts.slice(0, -1)
		
		const meta_display_price = productItem.DemoPrice.toString()
		const meta_message = productItem.Message
		const meta_head_product_intro = productItem.HeadProductIntro
		let meta_overview_options = ''
		if (productItem.DisplayDesignIcon) {
			meta_overview_options += 'Customizable'
		}
		if (productItem.DisplayFreeShipIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Free Ground Shipping' : '|Free Ground Shipping'
		}
		if (productItem.DisplayCanadaIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Ships to Canada' : '|Ships to Canada'
		}
		if (productItem.DisplayFedExIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Ships FedEx' : '|Ships FedEx'
		}
		if (productItem.DisplayPrintIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Print Services Available' : '|Print Services Available'
		}
		if (productItem.DisplaySaleDiscount) {
			meta_overview_options += meta_overview_options == '' ? 'Price Match' : '|Price Match'
		}

		const meta_description_title = productItem.Section1Title == '' ? 'Description' : productItem.Section1Title
		const meta_description = productItem.Section1Content
		const meta_features_title = productItem.Section2Title
		const meta_features_content = productItem.Section2Content
		let meta_additional_title1 = ''
		let meta_additional_content1 = ''
		let meta_otheroptions_content1 = ''
		let meta_additional_title2 = ''
		let meta_additional_content2 = ''
		let meta_otheroptions_content2 = ''
		let meta_additional_title3 = ''
		let meta_additional_content3 = ''
		let meta_otheroptions_content3 = ''
		if (sectionTitleList1.includes(productItem.Section3Title)) {
			meta_otheroptions_content1 = productItem.Section3Content
		} else {
			meta_additional_title1 = productItem.Section3Title
			meta_additional_content1 = productItem.Section3Content
		}
		if (sectionTitleList2.includes(productItem.Section4Title)) {
			meta_otheroptions_content2 = productItem.Section4Content
		} else {
			meta_additional_title2 = productItem.Section4Title
			meta_additional_content2 = productItem.Section4Content
		}
		if (sectionTitleList3.includes(productItem.Section5Title)) {
			meta_otheroptions_content3 = productItem.Section5Content
		} else {
			meta_additional_title3 = productItem.Section5Title
			meta_additional_content3 = productItem.Section5Content
		}
		
		const meta_specifications_title = 'Specifications'
		// Getting the contents of specifications tab
		const filterData = secondTags.split(',')
		let meta_specifications_content = ''
		specialSectionTitleList.forEach((specialSectionTitle, sectionTitleIndex) => {
			filterNameList[sectionTitleIndex].forEach((filterName, filterIndex) => {
				let properFilters = filterData.filter(fd => fd.includes(filterName))
				if (properFilters.length > 0) {
					// if result doesn't include sectionTitle, it adds it
					meta_specifications_content += meta_specifications_content.includes(specialSectionTitle) ? '' : '<h2>' + specialSectionTitle + '</h2><br/>'
					meta_specifications_content += filterName + ': '
					let properFilterOptions = properFilters.map(pf => {
						const splittedFilterString = pf.split(':')
						return splittedFilterString[1]
					})
					meta_specifications_content += properFilterOptions.join(', ') + '<br/>'
				}
			})
		})

		// console.log('------second tags: ', secondTags)
		// console.log('------specifications content: ', meta_specifications_content)
		
		const meta_swatch_header1 = productItem.SwatchHeader
		let meta_swatch_content1 = ''
		const productSwatchList = await productswatchCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList.forEach(productSwatchItem => {
			if (meta_swatch_content1 == '') {
				meta_swatch_content1 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content1 += ',' + productSwatchItem.SwatchName
			}
		})
		
		const meta_swatch_header2 = productItem.SwatchHeader3
		let meta_swatch_content2 = ''
		const productSwatchList2 = await productswatchCollection3.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList2.forEach(productSwatchItem => {
			if (meta_swatch_content2 == '') {
				meta_swatch_content2 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content2 += ',' + productSwatchItem.SwatchName
			}
		})

		const meta_swatch_header3 = productItem.SwatchHeader4
		let meta_swatch_content3 = ''
		const productSwatchList3 = await productswatchCollection4.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList3.forEach(productSwatchItem => {
			if (meta_swatch_content3 == '') {
				meta_swatch_content3 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content3 += ',' + productSwatchItem.SwatchName
			}
		})

		const meta_mattes_header = productItem.MattesHeader
		let meta_mattes_content = ''
		const mattesList = await productmattesCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()

		mattesList.forEach(mattesItem => {
			if (meta_mattes_content == '') {
				meta_mattes_content += mattesItem.MatteName
			} else {
				meta_mattes_content += ',' + mattesItem.MatteName
			}
		})

		const meta_movie_alt = productItem.MovieAlt
		const meta_movie_upload = productItem.MovieUpload
		const meta_movie_upload_name = productItem.MovieUploadName
		const meta_movie_thumb1 = productItem.MovieThumb1
		const meta_movie_upload2 = productItem.MovieUpload2
		const meta_movie_upload2_name = productItem.MovieUpload2Name
		const meta_movie_upload2_thumb = productItem.MovieThumb2
		const meta_movie_upload3 = productItem.MovieUpload3
		const meta_movie_upload3_name = productItem.MovieUpload3Name
		const meta_movie_upload3_thumb = productItem.MovieThumb3
		let meta_shipping_options = ''
		if (productItem.DisplayFreeShipIcon) {
			meta_shipping_options += 'Free Ground Shipping'
		}
		if (productItem.DisplayCanadaIcon) {
			meta_shipping_options += meta_shipping_options == '' ? 'Ships to Canada' : '|Ships to Canada'
		}
		if (productItem.DisplayFedExIcon) {
			meta_shipping_options += meta_shipping_options == '' ? 'Ships FedEx' : '|Ships FedEx'
		}
		const relatedProductList = await productCollection.find({
			SiteID: 1,
			ProductID: {
				$in: productItem.Related_Products.split(',')
			}
		}).toArray()
		let meta_related_products = ''
		relatedProductList.forEach(relatedProductItem => {
			if (meta_related_products == '') {
				meta_related_products += relatedProductItem.shopifyProductId
			} else {
				meta_related_products += ',' + relatedProductItem.shopifyProductId
			}
		})

		const meta_has_warranty = productItem.HasWarranty
		const meta_warranty_content = productItem.WarrantyPopup

		// getting string of sizechart
		let sizechartString = ''
		let chartRowList = await chartRowCollection.find({SiteID: 1, ProductID: productItem.ProductID}).sort({ RowNum: 1 }).toArray()
		let chartColumnList = await chartColumnCollection.find({SiteID: 1, ProductID: productItem.ProductID}).toArray()

		await asyncForEach1(chartColumnList, async (chartColumn) => {
			sizechartString += chartColumn.ColumnName + ','
		})
		sizechartString = sizechartString.slice(0, -1)
		sizechartString += '\n'
		await asyncForEach2(chartRowList, async (chartRow) => {
			const chartValues = await chartValueCollection.find({ChartRowID: chartRow.ChartRowID}).sort({ChartColumnID: 1}).toArray()
			const columnString = await chartValues.map(chartValue => {
					return chartValue.ChartValue
			})
			sizechartString += columnString.join(',')
			sizechartString += '\n'
		})

		sizechartString = sizechartString.slice(0, -1)

		// console.log('-----', productItem.ProductID, sizechartString)

		// Get the string for product badges
		// Quick Shipping and Free Shipping -> quick|free
		let meta_product_badges = ''
		if (productItem.ShipDaysFrom < 3 && productItem.ShipDaysTo < 4) {
			meta_product_badges += 'quick'
		}
		if (productItem.DisplayFreightIcon || productItem.DisplayFreeShipIcon) {
			meta_product_badges += meta_product_badges == '' ? 'free' : '|free'
		}

		// const meta_shipping_tags = '???'
		// const meta_multiple_options = '???'

		// ---------------end of product custom fields----------------------
		// -----------update product------------------

		const productData = {
			// 'title': productTitle,
			// 'body_html': productBodyHtml,
			// 'product_type': productType,
			// 'published_at': publishedAt,
			// template_suffix: 'group',
			// 'metafields_global_title_tag': metafieldsGlobalTitleTag,
			// 'metafields_global_description_tag': metafieldsGlobalDescriptionTag,
			// 'vendor': vendorName,
			// 'tags': tagString,
			// 'images': images,
			// meta data
			'metafields': [
				{
					key: 'qty_discounts',
					value: meta_qty_discounts,
					value_type: 'string',
					namespace: 'block'
				},
				{
					'key': 'display_price',
					'value': meta_display_price,
					'value_type': 'string',
					'namespace': 'base'
				},
				{
					key: 'message',
					value: meta_message,
					value_type: 'string',
					namespace: 'base'
				},
				{
					key: 'product_id',
					value: productItem.ProductID,
					value_type: 'string',
					namespace: 'base'
				},
				{
					key: 'head_product_intro',
					value: meta_head_product_intro,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'options',
					value: meta_overview_options,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'description_title',
					value: meta_description_title,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'description',
					value: meta_description,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'features_title',
					value: meta_features_title,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'features_content',
					value: meta_features_content,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'product_badges',
					value: meta_product_badges,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'title1',
					value: meta_additional_title1,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'title2',
					value: meta_additional_title2,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'title3',
					value: meta_additional_title3,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'content1',
					value: meta_additional_content1,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'content2',
					value: meta_additional_content2,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'content3',
					value: meta_additional_content3,
					value_type: 'string',
					namespace: 'additions'
				},
				{
					key: 'content1',
					value: meta_otheroptions_content1,
					value_type: 'string',
					namespace: 'other_options'
				},
				{
					key: 'content2',
					value: meta_otheroptions_content2,
					value_type: 'string',
					namespace: 'other_options'
				},
				{
					key: 'content3',
					value: meta_otheroptions_content3,
					value_type: 'string',
					namespace: 'other_options'
				},
				{
					key: 'subject',
					value: meta_specifications_title,
					value_type: 'string',
					namespace: 'specifications'
				},
				{
					key: 'content',
					value: meta_specifications_content.toString(),
					value_type: 'string',
					namespace: 'specifications'
				},
				{
					key: 'sizechart',
					value: sizechartString,
					value_type: 'string',
					namespace: 'sizechart'
				},
				{
					key: 'header1',
					value: meta_swatch_header1,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'header2',
					value: meta_swatch_header2,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'header3',
					value: meta_swatch_header3,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'content1',
					value: meta_swatch_content1,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'content2',
					value: meta_swatch_content2,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'content3',
					value: meta_swatch_content3,
					value_type: 'string',
					namespace: 'swatch'
				},
				{
					key: 'header',
					value: meta_mattes_header,
					value_type: 'string',
					namespace: 'mattes'
				},
				{
					key: 'content',
					value: meta_mattes_content,
					value_type: 'string',
					namespace: 'mattes'
				},
				{
					key: 'alt_text',
					value: meta_movie_alt,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload1',
					value: meta_movie_upload,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload2',
					value: meta_movie_upload2,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload3',
					value: meta_movie_upload3,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload_name1',
					value: meta_movie_upload_name,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload_name2',
					value: meta_movie_upload2_name,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'upload_name3',
					value: meta_movie_upload3_name,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'thumb1',
					value: meta_movie_thumb1,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'thumb2',
					value: meta_movie_upload2_thumb,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'thumb3',
					value: meta_movie_upload3_thumb,
					value_type: 'string',
					namespace: 'movie'
				},
				{
					key: 'shipping_options',
					value: meta_shipping_options,
					value_type: 'string',
					namespace: 'shipping'
				},
				{
					key: 'shipping_summary',
					value: meta_qty_discounts,
					value_type: 'string',
					namespace: 'shipping'
				},
				{
					key: 'has_warranty',
					value: meta_has_warranty,
					value_type: 'boolean',
					namespace: 'warranty'
				},
				{
					key: 'content',
					value: meta_warranty_content,
					value_type: 'string',
					namespace: 'warranty'
				}
			]
		}
		// console.log('------product data: ', meta_qty_discounts)
		// console.log('------product data: ', sizechartString)
		/*
		try{
			const onlineProductData = await shopify.product.create(productData)
			productCollection.updateOne(
				{_id: productItem._id},
				{$set: {
							shopifyProductId: onlineProductData.id,
							shopifyFirstVariantId: onlineProductData.variants[0].id,
							updatedOnline: 0
					}
				}
			)
			console.log('created with: ', productItem.ProductID)
		} catch (updateError) {
			var productError = new ProductError()
			productError.title = productItem.ModelName
			productError.dbProductId = productItem.ProductID
			productError.reason = updateError
			productError.save(err => {
				if (err) {
					return next(err)
				} else {
					console.log('Could not update product metafields with this: ', productItem.ProductID)
				}
			})
		}
		*/
	})

	res.render('home')
})

router.get('/updatefields', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const subcatCollection = mydb.collection('productsubcat')
	const seoCollection = mydb.collection('productseo')
	const dropShippingCollection = mydb.collection('dropshipping')
	const productfilterchoicesCollection = mydb.collection('productfilterchoices')
	const filtersCollection = mydb.collection('filters')
	const productquantityCollection = mydb.collection('productquantities')
	const productswatchCollection = mydb.collection('productswatches')
	const productswatchCollection3 = mydb.collection('productswatches3')
	const productswatchCollection4 = mydb.collection('productswatches4')
	const productmattesCollection = mydb.collection('productmattes')
	const productSpecialTitlesCollection = mydb.collection('product-special-titles')
	const chartRowCollection = mydb.collection('chartrows')
	const chartColumnCollection = mydb.collection('chartcolumns')
	const chartValueCollection = mydb.collection('chartvalues')

	// getting special section title list
	let sectionTitleList1 = []
	let sectionTitleList2 = []
	let sectionTitleList3 = []
	const specialTitleList = await productSpecialTitlesCollection.find({})
	specialTitleList.forEach(specialTitleItem => {
		if (specialTitleItem.Section3Title != '') {
			sectionTitleList1.push(specialTitleItem.Section3Title)
		}
		if (specialTitleItem.Section4Title != '') {
			sectionTitleList2.push(specialTitleItem.Section4Title)
		}
		if (specialTitleItem.Section5Title != '') {
			sectionTitleList3.push(specialTitleItem.Section5Title)
		}
	})
	const productIdList = [
		'tlbs',
		'sfc', 
		'SBMW-SHELF8-2024', 
		'scm-1117p', 'lscl', 'CBOECL-5050', 
		'TTR855', 'abmc', 'TKM514', 
		'SBMWIDE4-LED', 'LOREADHDH-2S-7248', 
		'sfwlbhl', 'fdg', 'sswf'
	]

	const productList = await productCollection.find({SiteID: 1, ProductID: {$in: productIdList}})
	// const productList = await productCollection.find({SiteID: 1})
	productList.forEach(async (productItem) => {
		const productTitle = productItem.ModelName
		const productSKU = productItem.ProductID
		const productBodyHtml = productItem.FullDesc
		// get title of subCategory
		const subCat = await subcatCollection.aggregate([
			{
				$match:
				{
					'ProductID': productItem.ProductID,
					'SiteID': 1
				}
			},
			{
				$lookup:
				{
					from: "subcategories",
					localField: "SubCatID",
					foreignField: "SubCatID",
					as: "subcategoryDetail"
				}
			}
		]).toArray()

		const productType = subCat[0] ? subCat[0].subcategoryDetail[0].Title : 'cannotfind'
		// get current time
		let date_ob = new Date()
		const currentTimestamp = date_ob.getFullYear() + "-" + 
													("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" +
													("0" + date_ob.getDate()).slice(-2) + "T" +
													("0" + date_ob.getHours()).slice(-2) + ":" +
													("0" + date_ob.getMinutes()).slice(-2) + ":" +
													("0" + date_ob.getSeconds()).slice(-2)
		
		const publishedAt = productItem.Active ? currentTimestamp : null

		// get first tags
		const seoDetail = await seoCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()

		const firstTags = seoDetail[0].MetaKeywords
		const metafieldsGlobalTitleTag = seoDetail[0].PageTitle
		const metafieldsGlobalDescriptionTag = seoDetail[0].MetaDesc
		// get dropshipping
		const dropShipping = await dropShippingCollection.find({DropShipID: productItem.DropShipID}).toArray()
		const vendorName = dropShipping[0].Name

		// get filters and filterchoices
		const filterChoiceList = await productfilterchoicesCollection.aggregate([
			{
				$match:
				{
					'product_id': productItem.ProductID
				}
			},
			{
				$lookup:
				{
					from: "filterchoices",
					localField: "filter_choice_id",
					foreignField: "filter_choice_id",
					as: "filterchoiceDetail"
				}
			}
		]).toArray()

		let secondTags = ''

		await asyncForEach1(filterChoiceList, async (filterchoiceItem) => {
			if (filterchoiceItem.filterchoiceDetail[0]) {
				const filterchoiceDetail = filterchoiceItem.filterchoiceDetail[0]
				const filterDetail = await filtersCollection.find({filter_id: filterchoiceDetail.filter_id}).toArray()
				const filterString = filterDetail[0].name + ':' + filterchoiceDetail.name
				if (secondTags == '') {
					secondTags += filterString
				} else {
					secondTags += ',' + filterString
				}
			}
		})

		const secondTagsWithComma = firstTags == '' ? secondTags : ',' + secondTags

		let thirdTag = productItem.FreeGround ? 'free-ground' : ''
		thirdTag = (firstTags == '' && secondTags == '') ? thirdTag : (thirdTag == '' ? '' : ',' + thirdTag)

		const tagString = firstTags + secondTagsWithComma + thirdTag

		// ----------------end of product fields-----------------------

		// ---------------start of product images----------------------

		let images = [
			{
				position: 1,
				src: 'https://displays4sale.com/i/p1/' + productItem.Image1,
				alt: seoDetail[0].Image1Alt
			},
			{
				position: 2,
				src: 'https://displays4sale.com/i/p2/' + productItem.Image2,
				alt: seoDetail[0].Image2Alt
			},
			{
				position: 3,
				src: 'https://displays4sale.com/i/p3/' + productItem.Image3,
				alt: seoDetail[0].Image3Alt
			},
			{
				position: 4,
				src: 'https://displays4sale.com/i/p4/' + productItem.Image4,
				alt: seoDetail[0].Image4Alt
			},
		]

		// ----------------end of product images-----------------------

		// ---------------start of product custom fields----------------------

		let meta_qty_discounts = ''
		const quantityList = await productquantityCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		await asyncForEach1(quantityList, async (quantityItem) => {
			const qty_discount = 'QTY ' + quantityItem.QuantityFrom + '-' + quantityItem.QuantityTo + ',' +
														quantityItem.PercentOff + '%, ' + quantityItem.LeadTimeShip + '\n'
			meta_qty_discounts += qty_discount
		})
		meta_qty_discounts = meta_qty_discounts.slice(0, -1)
		
		const meta_display_price = productItem.DemoPrice.toString()
		const meta_message = productItem.Message
		const meta_head_product_intro = productItem.HeadProductIntro
		let meta_overview_options = ''
		if (productItem.DisplayDesignIcon) {
			meta_overview_options += 'Customizable'
		}
		if (productItem.DisplayFreeShipIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Free Ground Shipping' : '|Free Ground Shipping'
		}
		if (productItem.DisplayCanadaIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Ships to Canada' : '|Ships to Canada'
		}
		if (productItem.DisplayFedExIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Ships FedEx' : '|Ships FedEx'
		}
		if (productItem.DisplayPrintIcon) {
			meta_overview_options += meta_overview_options == '' ? 'Print Services Available' : '|Print Services Available'
		}
		if (productItem.DisplaySaleDiscount) {
			meta_overview_options += meta_overview_options == '' ? 'Price Match' : '|Price Match'
		}

		const meta_description_title = productItem.Section1Title == '' ? 'Description' : productItem.Section1Title
		const meta_description = productItem.Section1Content
		const meta_features_title = productItem.Section2Title
		const meta_features_content = productItem.Section2Content
		let meta_additional_title1 = ''
		let meta_additional_content1 = ''
		let meta_otheroptions_content1 = ''
		let meta_additional_title2 = ''
		let meta_additional_content2 = ''
		let meta_otheroptions_content2 = ''
		let meta_additional_title3 = ''
		let meta_additional_content3 = ''
		let meta_otheroptions_content3 = ''
		if (sectionTitleList1.includes(productItem.Section3Title)) {
			meta_otheroptions_content1 = productItem.Section3Content
		} else {
			meta_additional_title1 = productItem.Section3Title
			meta_additional_content1 = productItem.Section3Content
		}
		if (sectionTitleList2.includes(productItem.Section4Title)) {
			meta_otheroptions_content2 = productItem.Section4Content
		} else {
			meta_additional_title2 = productItem.Section4Title
			meta_additional_content2 = productItem.Section4Content
		}
		if (sectionTitleList3.includes(productItem.Section5Title)) {
			meta_otheroptions_content3 = productItem.Section5Content
		} else {
			meta_additional_title3 = productItem.Section5Title
			meta_additional_content3 = productItem.Section5Content
		}
		
		const meta_specifications_title = 'Specifications'
		// Getting the contents of specifications tab
		const filterData = secondTags.split(',')
		let meta_specifications_content = ''
		specialSectionTitleList.forEach((specialSectionTitle, sectionTitleIndex) => {
			filterNameList[sectionTitleIndex].forEach((filterName, filterIndex) => {
				let properFilters = filterData.filter(fd => fd.includes(filterName))
				if (properFilters.length > 0) {
					// if result doesn't include sectionTitle, it adds it
					meta_specifications_content += meta_specifications_content.includes(specialSectionTitle) ? '' : '<h2>' + specialSectionTitle + '</h2><br/>'
					meta_specifications_content += filterName + ': '
					let properFilterOptions = properFilters.map(pf => {
						const splittedFilterString = pf.split(':')
						return splittedFilterString[1]
					})
					meta_specifications_content += properFilterOptions.join(', ') + '<br/>'
				}
			})
		})

		// console.log('------second tags: ', secondTags)
		// console.log('------specifications content: ', meta_specifications_content)
		
		const meta_swatch_header1 = productItem.SwatchHeader
		let meta_swatch_content1 = ''
		const productSwatchList = await productswatchCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList.forEach(productSwatchItem => {
			if (meta_swatch_content1 == '') {
				meta_swatch_content1 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content1 += ',' + productSwatchItem.SwatchName
			}
		})
		
		const meta_swatch_header2 = productItem.SwatchHeader3
		let meta_swatch_content2 = ''
		const productSwatchList2 = await productswatchCollection3.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList2.forEach(productSwatchItem => {
			if (meta_swatch_content2 == '') {
				meta_swatch_content2 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content2 += ',' + productSwatchItem.SwatchName
			}
		})

		const meta_swatch_header3 = productItem.SwatchHeader4
		let meta_swatch_content3 = ''
		const productSwatchList3 = await productswatchCollection4.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()
		productSwatchList3.forEach(productSwatchItem => {
			if (meta_swatch_content3 == '') {
				meta_swatch_content3 += productSwatchItem.SwatchName
			} else {
				meta_swatch_content3 += ',' + productSwatchItem.SwatchName
			}
		})

		const meta_mattes_header = productItem.MattesHeader
		let meta_mattes_content = ''
		const mattesList = await productmattesCollection.find({
			SiteID: 1,
			ProductID: productItem.ProductID
		}).toArray()

		mattesList.forEach(mattesItem => {
			if (meta_mattes_content == '') {
				meta_mattes_content += mattesItem.MatteName
			} else {
				meta_mattes_content += ',' + mattesItem.MatteName
			}
		})

		const meta_movie_alt = productItem.MovieAlt
		const meta_movie_upload = productItem.MovieUpload
		const meta_movie_upload_name = productItem.MovieUploadName
		const meta_movie_thumb1 = productItem.MovieThumb1
		const meta_movie_upload2 = productItem.MovieUpload2
		const meta_movie_upload2_name = productItem.MovieUpload2Name
		const meta_movie_upload2_thumb = productItem.MovieThumb2
		const meta_movie_upload3 = productItem.MovieUpload3
		const meta_movie_upload3_name = productItem.MovieUpload3Name
		const meta_movie_upload3_thumb = productItem.MovieThumb3
		let meta_shipping_options = ''
		if (productItem.DisplayFreeShipIcon) {
			meta_shipping_options += 'Free Ground Shipping'
		}
		if (productItem.DisplayCanadaIcon) {
			meta_shipping_options += meta_shipping_options == '' ? 'Ships to Canada' : '|Ships to Canada'
		}
		if (productItem.DisplayFedExIcon) {
			meta_shipping_options += meta_shipping_options == '' ? 'Ships FedEx' : '|Ships FedEx'
		}
		const relatedProductList = await productCollection.find({
			SiteID: 1,
			ProductID: {
				$in: productItem.Related_Products.split(',')
			}
		}).toArray()
		let meta_related_products = ''
		relatedProductList.forEach(relatedProductItem => {
			if (meta_related_products == '') {
				meta_related_products += relatedProductItem.shopifyProductId
			} else {
				meta_related_products += ',' + relatedProductItem.shopifyProductId
			}
		})

		const meta_has_warranty = productItem.HasWarranty ? 'true' : 'false'
		const meta_warranty_content = productItem.WarrantyPopup

		// getting string of sizechart
		let sizechartString = ''
		let chartRowList = await chartRowCollection.find({SiteID: 1, ProductID: productItem.ProductID}).sort({ RowNum: 1 }).toArray()
		let chartColumnList = await chartColumnCollection.find({SiteID: 1, ProductID: productItem.ProductID}).toArray()

		await asyncForEach1(chartColumnList, async (chartColumn) => {
			sizechartString += chartColumn.ColumnName + ','
		})
		sizechartString = sizechartString.slice(0, -1)
		sizechartString += '\n'
		await asyncForEach2(chartRowList, async (chartRow) => {
			const chartValues = await chartValueCollection.find({ChartRowID: chartRow.ChartRowID}).sort({ChartColumnID: 1}).toArray()
			const columnString = await chartValues.map(chartValue => {
					return chartValue.ChartValue
			})
			sizechartString += columnString.join(',')
			sizechartString += '\n'
		})

		sizechartString = sizechartString.slice(0, -1)

		// console.log('-----', productItem.ProductID, sizechartString)

		// Get the string for product badges
		// Quick Shipping and Free Shipping -> quick|free
		let meta_product_badges = ''
		if (productItem.ShipDaysFrom < 3 && productItem.ShipDaysTo < 4) {
			meta_product_badges += 'quick'
		}
		if (productItem.DisplayFreightIcon || productItem.DisplayFreeShipIcon) {
			meta_product_badges += meta_product_badges == '' ? 'free' : '|free'
		}

		// const meta_shipping_tags = '???'
		// const meta_multiple_options = '???'

		// ---------------end of product custom fields----------------------
		// -----------update product------------------

		const productData = {
			// 'title': productTitle,
			// 'body_html': productBodyHtml,
			// 'product_type': productType,
			// 'published_at': publishedAt,
			// 'metafields_global_title_tag': metafieldsGlobalTitleTag,
			// 'metafields_global_description_tag': metafieldsGlobalDescriptionTag,
			// 'vendor': vendorName,
			// 'tags': tagString,
			// 'images': images,
			// variants
			// 'variants': [
			// 	{
			// 		'id': productItem.shopifyFirstVariantId,
			// 		'sku': productItem.ProductID.toUpperCase()
			// 	}
			// ],
			// meta data
			'metafields': [
				// {
				// 	key: 'qty_discounts',
				// 	value: meta_qty_discounts,
				// 	value_type: 'string',
				// 	namespace: 'block'
				// },
				// {
				// 	'key': 'display_price',
				// 	'value': meta_display_price,
				// 	'value_type': 'string',
				// 	'namespace': 'base'
				// },
				// {
				// 	key: 'message',
				// 	value: meta_message,
				// 	value_type: 'string',
				// 	namespace: 'base'
				// },
				// {
				// 	key: 'product_id',
				// 	value: productItem.ProductID,
				// 	value_type: 'string',
				// 	namespace: 'base'
				// }
				// {
				// 	key: 'head_product_intro',
				// 	value: meta_head_product_intro,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'options',
				// 	value: meta_overview_options,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'description_title',
				// 	value: meta_description_title,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'description',
				// 	value: meta_description,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'features_title',
				// 	value: meta_features_title,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'features_content',
				// 	value: meta_features_content,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'product_badges',
				// 	value: meta_product_badges,
				// 	value_type: 'string',
				// 	namespace: 'overview'
				// },
				// {
				// 	key: 'title1',
				// 	value: meta_additional_title1,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'title2',
				// 	value: meta_additional_title2,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'title3',
				// 	value: meta_additional_title3,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'content1',
				// 	value: meta_additional_content1,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'content2',
				// 	value: meta_additional_content2,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'content3',
				// 	value: meta_additional_content3,
				// 	value_type: 'string',
				// 	namespace: 'additions'
				// },
				// {
				// 	key: 'content1',
				// 	value: meta_otheroptions_content1,
				// 	value_type: 'string',
				// 	namespace: 'other_options'
				// },
				// {
				// 	key: 'content2',
				// 	value: meta_otheroptions_content2,
				// 	value_type: 'string',
				// 	namespace: 'other_options'
				// },
				// {
				// 	key: 'content3',
				// 	value: meta_otheroptions_content3,
				// 	value_type: 'string',
				// 	namespace: 'other_options'
				// },
				// {
				// 	key: 'subject',
				// 	value: meta_specifications_title,
				// 	value_type: 'string',
				// 	namespace: 'specifications'
				// },
				// {
				// 	key: 'content',
				// 	value: meta_specifications_content.toString(),
				// 	value_type: 'string',
				// 	namespace: 'specifications'
				// },
				// {
				// 	key: 'sizechart',
				// 	value: sizechartString,
				// 	value_type: 'string',
				// 	namespace: 'sizechart'
				// },
				// {
				// 	key: 'header1',
				// 	value: meta_swatch_header1,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'header2',
				// 	value: meta_swatch_header2,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'header3',
				// 	value: meta_swatch_header3,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'content1',
				// 	value: meta_swatch_content1,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'content2',
				// 	value: meta_swatch_content2,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'content3',
				// 	value: meta_swatch_content3,
				// 	value_type: 'string',
				// 	namespace: 'swatch'
				// },
				// {
				// 	key: 'header',
				// 	value: meta_mattes_header,
				// 	value_type: 'string',
				// 	namespace: 'mattes'
				// },
				// {
				// 	key: 'content',
				// 	value: meta_mattes_content,
				// 	value_type: 'string',
				// 	namespace: 'mattes'
				// },
				// {
				// 	key: 'alt_text',
				// 	value: meta_movie_alt,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload1',
				// 	value: meta_movie_upload,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload2',
				// 	value: meta_movie_upload2,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload3',
				// 	value: meta_movie_upload3,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload_name1',
				// 	value: meta_movie_upload_name,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload_name2',
				// 	value: meta_movie_upload2_name,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'upload_name3',
				// 	value: meta_movie_upload3_name,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'thumb1',
				// 	value: meta_movie_thumb1,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'thumb2',
				// 	value: meta_movie_upload2_thumb,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'thumb3',
				// 	value: meta_movie_upload3_thumb,
				// 	value_type: 'string',
				// 	namespace: 'movie'
				// },
				// {
				// 	key: 'shipping_options',
				// 	value: meta_shipping_options,
				// 	value_type: 'string',
				// 	namespace: 'shipping'
				// },
				// {
				// 	key: 'shipping_summary',
				// 	value: meta_qty_discounts,
				// 	value_type: 'string',
				// 	namespace: 'shipping'
				// },
				// {
				// 	key: 'related_products',
				// 	value: meta_related_products,
				// 	value_type: 'string',
				// 	namespace: 'base'
				// },
				{
					key: 'has_warranty',
					value: meta_has_warranty,
					value_type: 'string',
					namespace: 'warranty'
				},
				// {
				// 	key: 'content',
				// 	value: meta_warranty_content,
				// 	value_type: 'string',
				// 	namespace: 'warranty'
				// }
			]
		}
		// console.log('-------product id: ', productItem.ProductID)
		// console.log('-------- related products: ', productItem.Related_Products)
		// console.log('------product data: ', meta_related_products)
		// console.log('------product data: ', sizechartString)
		try{
			await shopify.product.update(productItem.shopifyProductId, productData)
			console.log('updated with: ', productItem.ProductID)
		} catch (updateError) {
			var productError = new ProductError()
			productError.title = productItem.ModelName
			productError.dbProductId = productItem.ProductID
			productError.reason = updateError
			productError.save(err => {
				if (err) {
					return next(err)
				} else {
					console.log('Could not update product metafields with this: ', productItem.ProductID)
				}
			})
		}
	})

	res.render('home')
})

router.get("/createproducts", async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const subcatCollection = mydb.collection('productsubcat')
	const chartRowCollection = mydb.collection('chartrows')
	const chartColumnCollection = mydb.collection('chartcolumns')
	const chartValueCollection = mydb.collection('chartvalues')
	
	const dbProductList = await productCollection.find({SiteID: 1})
	// const dbProductList = await productCollection.find({SiteID: 1, ProductID: {$in: ['SFWB-1114', 'LOREADHDP-1S-7248', 'CBLBW-2016', 'CBMBA-1812', 'OFCORKW361-3672']}})
	const siteList = ['displays4sale', 'swingpanels', 'floorstands', 'swingframes4sale', 'snapframes4sale', 'posterdisplays4sale', 
											'outdoordisplaycases', 'shadowboxes', 'lightboxes4sale', 'letterboards4sale', 'bulletinboards4sale']
	dbProductList.forEach(async (dbProduct) => {
		// Get the title of Subcategories related with this product in this site [add subcategory names into product tag]  ## please check productsubcat collection
		var subCategories = await subcatCollection.find({ProductID: dbProduct.ProductID}).toArray()
		var siteTitleList = [ ...new Set(subCategories.map(subCat => 'store**' + siteList[subCat.SiteID - 1]))]
		// remove 'store**displays4sale' from array
		var thisSiteIndex = siteTitleList.indexOf('store**displays4sale')
		if (thisSiteIndex !== -1) siteTitleList.splice(thisSiteIndex, 1)

		// the list of siteID related with this product [add sitenames into product tag]
		var subCategoryTitleList = []
		var subCats = await subcatCollection.aggregate([
			{ $match: {
				'ProductID': dbProduct.ProductID,
				'SiteID': 1
			}},
			{ $lookup: {
					from: 'subcategories',
					localField: 'SubCatID',
					foreignField: 'SubCatID',
					as: 'subcategoryDetail'
				}
			}
		]).toArray()

		var subCategoryTitleList = subCats.map(subCat => subCat.subcategoryDetail[0].Title)
		var productTags = ''
		productTags = subCategoryTitleList.concat(siteTitleList).join(', ')

		// Getting the string of size chart
		var sizechartString = ''
		var chartRowList = await chartRowCollection.find({SiteID: 1, ProductID: dbProduct.ProductID}).sort({ RowNum: 1 }).toArray()
		var chartColumnList = await chartColumnCollection.find({SiteID: 1, ProductID: dbProduct.ProductID}).toArray()

		await asyncForEach1(chartColumnList, async (chartColumn) => {
			sizechartString += chartColumn.ColumnName + ','
		})
		sizechartString = sizechartString.slice(0, -1)
		sizechartString += '\n'
		await asyncForEach2(chartRowList, async (chartRow) => {
			var chartValues = await chartValueCollection.find({ChartRowID: chartRow.ChartRowID}).sort({ChartColumnID: 1}).toArray()
			var columnString = await chartValues.map(chartValue => {
					return chartValue.ChartValue
			})
			sizechartString += columnString.join(',')
			sizechartString += '\n'
		})

		sizechartString = sizechartString.slice(0, -1)

		// Getting the string of discount
		var quantityString = ''
		var dbQuantities = await quantityCollection.find({SiteID: 1, ProductID: dbProduct.ProductID}).sort({QuantityID: 1}).toArray()

		await asyncForEach3(dbQuantities, async (quantity) => {
			quantityString += 'QTY ' + quantity.QuantityFrom + '-' + quantity.QuantityTo + ','
			quantityString += quantity.PercentOff ? quantity.PercentOff + '%' : 'N/A'
			quantityString += '\n'
		})

		// Generate product data to submit into shopify store
		var product = {
			title: dbProduct.ModelName,
			body_html: dbProduct.FullDesc,
			published: dbProduct.Active,
			template_suffix: 'group',
			tags: productTags,
			images: [],
			metafields: [
				{
					key: 'warranty_returns',
					value: dbProduct.WarrantyPopup,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'ship_desc',
					value: dbProduct.ShippingOptionContent,
					value_type: 'string',
					namespace: 'overview'
				},
				{
					key: 'subject',
					value: dbProduct.Section3Title ? dbProduct.Section3Title : '',
					value_type: 'string',
					namespace: 'specifications'
				},
				{
					key: 'contents',
					value: dbProduct.Section3Content ? dbProduct.Section3Content : '',
					value_type: 'string',
					namespace: 'specifications'
				},
				{
					key: 'size_chart',
					value: sizechartString,
					value_type: 'string',
					namespace: 'sizechart'
				},
				{
					key: 'option_title',
					value: dbProduct.Section2Title ? dbProduct.Section2Title : '',
					value_type: 'string',
					namespace: 'other_options'
				},
				{
					key: 'option_contents',
					value: dbProduct.Section2Content ? dbProduct.Section2Content : '',
					value_type: 'string',
					namespace: 'other_options'
				},
				{
					key: 'product_id',
					value: dbProduct.ProductID,
					value_type: 'string',
					namespace: 'base'
				},
				{
					key: 'qty_discounts',
					value: quantityString,
					value_type: 'string',
					namespace: 'block'
				},
				{
					key: 'link1',
					value: 'https://www.displays4sale.com//ProdSheet/Default.aspx?p=' + dbProduct.URLField + '&s=1&ts=1118201938524150',
					value_type: 'string',
					namespace: 'download'
				},
				{
					key: 'name1',
					value: 'Product Sheet',
					value_type: 'string',
					namespace: 'download'
				},
				{
					key: 'type1',
					value: 'PDF',
					value_type: 'string',
					namespace: 'download'
				},
				{
					key: 'link2',
					value: 'https://www.displays4sale.com/i/is/' + dbProduct.PDF2,
					value_type: 'string',
					namespace: 'download'
				},
				{
					key: 'name2',
					value: 'Instruction Sheet',
					value_type: 'string',
					namespace: 'download'
				},
				{
					key: 'type2',
					value: 'PDF',
					value_type: 'string',
					namespace: 'download'
				}
			]
		}
		if (dbProduct.Image1 != '') {
			product.images.push({
				src: 'https://displays4sale.com/i/p1/' + dbProduct.Image1
			})
		}
		if (dbProduct.Image2 != '') {
			product.images.push({
				src: 'https://displays4sale.com/i/p2/' + dbProduct.Image2
			})
		}
		if (dbProduct.Image3 != '') {
			product.images.push({
				src: 'https://displays4sale.com/i/p3/' + dbProduct.Image3
			})
		}
		if (dbProduct.Image4 != '') {
			product.images.push({
				src: 'https://displays4sale.com/i/p4/' + dbProduct.Image4
			})
		}

		shopify.product.create(product).then(result => {
			productCollection.updateOne(
				{_id: dbProduct._id},
				{$set: {
							shopifyProductId: result.id,
							shopifyFirstVariantId: result.variants[0].id,
							shopifyFirstOptionId: result.options[0].id,
							updatedOnline: 0
					}
				}
			)
		}).catch(shopifyError => {
			var productError = new ProductError()
			productError.title = dbProduct.ModelName
			productError.dbProductId = dbProduct.ProductID
			productError.save(err => {
				if (err) {
					return next(err)
				} else {
					console.log('Could not create product with this: ', dbProduct.ProductID)
				}
			})
		})
	})
	res.render('home')
})

router.get('/createtesttable', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const producttestCollection = mydb.collection('products-test')
	
	for (let index = 1; index < 21; index++) {
		productCollection.find({SiteID: 1})
		.skip(500 * index)
		.limit(1)
		.forEach(product => {
			producttestCollection.insertOne(product)
		})
	}
})
router.get('/updateproducts', async(req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const dbProductList = await productCollection.find({SiteID: 1})
	/*const dbProductList = await productCollection.find({SiteID: 1, ProductID: {$in: [
			'SBMW-SHELF12-4060', 'sstrxlmt-deep-4060', 'PEWLWF-2436', 'ssmcmat2-1824', 'TLESMAT3-1220', 'SCBBIRCH-1117',
			'DCWLCORK-3648', 'SCIBBL234-9630', 'scmirch-8511p', 'SFWBXL-2484', 'sfwm362-2030',
			'SBMW-SHELF4-1620', 'ssmcss-8511', 'DCOL2', 'LSCBBRH234-6040', 'sbwlshelf12', 'TBA-4848', 'SCIBBRH234-7230'
		]
	}})*/
	dbProductList.forEach(async (dbProduct) => {
		// Generate product data to be updated
		var product = {
			id: dbProduct.shopifyProductId,
			metafields: [
				{
					key: 'product_id',
					value: dbProduct.ProductID,
					value_type: 'string',
					namespace: 'base'
				}
			]
		}
		
		shopify.product.update(dbProduct.shopifyProductId, product).then(result => {
			productCollection.updateOne(
				{_id: dbProduct._id},
				{$set: {updatedOnline: 1}}
			).then(result => {
				console.log('updated: ', dbProduct.ProductID)
			})
		}).catch(shopifyError => {
			var productError = new ProductError()
			productError.title = dbProduct.ModelName
			productError.dbProductId = dbProduct.ProductID
			productError.save(err => {
				if (err) {
					return next(err)
				} else {
					console.log('Could not update product metafields with this: ', dbProduct.ProductID)
				}
			})
		})
	})

	res.render('home')
})

router.get('/getFirstProperty', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const productAttribCatCollection = mydb.collection('productattribcat')
	const attribCatCollection = mydb.collection('attribcat')
	const productList = await productCollection.find({ SiteID: 1}, { ProductID: 1}).toArray()

	var propertyList = []

	await asyncForEach1(productList, async (productItem) => {
		await productAttribCatCollection.findOne({$query: {SiteID: 1, ProductID: productItem.ProductID}, $orderby: {_id: 1}}).then(attribCatResult => {
			attribCatCollection.findOne({AttribCatID: attribCatResult.AttribCatID}).then(result => {
				if (!propertyList.includes(result.AttrCategory)) {
					propertyList.push(result.AttrCategory)
				}
			})
		})
	})
	console.log(propertyList.join(','))
	console.log('------------------end----------------------')
	process.exit()
})

router.get('/test', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const productAttribCatCollection = mydb.collection('productattribcat')
	// const attribCatCollection = mydb.collection('attribcat')
	
	var productCatList = await productAttribCatCollection.find({SiteID: 1, AttribCatID: '17'}).toArray()
	var productIDList = await productCatList.map(proCat => {
		return proCat.ProductID
	})

	const productList = await productCollection.find({ SiteID: 1, ProductID: {$in: productIDList}}, {ProductID: 1}).toArray()
	console.log('===================== start  ====================')
	await asyncForEach1(productList, async (pro) => {
		var proCats = await productAttribCatCollection.find({SiteID: 1, ProductID: pro.ProductID}).toArray()
		var catIDList = proCats.map(cat => {
			return cat.AttribCatID
		})
		if (catIDList[0] == 17) {
			console.log(pro.ProductID + ': ' + proCats.length + ' : ' + catIDList.join(','))
		}
	})
	
	console.log('===================== end  ====================')
	process.exit()
})

router.get('/createVariant', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const productAttribCatCollection = mydb.collection('productattribcat')
	const productAttribCollection = mydb.collection('productattributes')
	const attribCatCollection = mydb.collection('attribcat')
	const attributesCollection = mydb.collection('attributes')
	const propertyNameString = "Display Type, Viewable Area, Overall Size, Insert Size, Poster Board Size, Interior Size, Menu Case Layout, Cork Board Frame Size, Letterboard Size, Corkboard Size, Panel Size, Helvetica Letter Sets, Graphic Insert, Dry Erase Board Size, Banner Stand, SignHolders, Display Width, Sidewalk Sign, Light Post Sign, Sign Panel , Sign Stand, Easy Tack Board Size, Cork Bar Length, Post Options , Poster Width, Clamps, Graphic Holders, Graphic Width, Fabric Graphic Size, Chalk Board Size, Reader Letter Sets, Message Panel Size, Wet Erase Board Size, Roman Letter Sets, Floor Stand, Style, Easel, Clamp Sign Stand, Counter Top Display, Marker Type, Sign Face, Letter Tracks, Additional Headers, Letter Set, Backing Board, Overall Sleeve Size, Overall Panel Size, Poster (Insert) Size, Finish, Portable Pole Sign, Marker Board Size, Header Panel, Brochure Holder, Newspaper Name, Newspaper Size, Wall Bracket, Moulding Display, Poster Size, Base Width, Tabletop Sign Stand, Pole/Base, Elliptical Stand, Banner Size, Magnetic Mount, Catalog Holders, Plastic Lenses"
	const mainPropertyNameList = propertyNameString.split(', ')
	var mainPropertyList = []
	var mainPropertyIDList = []

	await asyncForEach1(mainPropertyNameList, async (propertyName) => {
		var attribCat = await attribCatCollection.findOne({SiteID: 1, AttrCategory: propertyName})
		mainPropertyList['a' + attribCat.AttribCatID] = propertyName
		mainPropertyIDList.push(attribCat.AttribCatID)
	})
	const productList = await productCollection.find({SiteID: 1, ProductID: {$in: [
		'accbb', 'W362'
	]}})
	productList.forEach(async (product) => {
		var mainPropertyItem = await productAttribCatCollection.find({SiteID: 1, ProductID: product.ProductID, AttribCatID: {$in: mainPropertyIDList}}).toArray()
		var enabledAttributeItemList = await productAttribCollection.find({SiteID: 1, ProductID: product.ProductID}).toArray()
		var enabledAttributeList = enabledAttributeItemList.map(productAttributeItem => { return productAttributeItem.AttributeID})
		if (mainPropertyItem.length > 0) {
			var attributeItemList = []
			if (mainPropertyItem.length == 2) {
				attributeItemList = await attributesCollection.find({AttribCatID: {$in: [mainPropertyItem[0].AttribCatID, mainPropertyItem[1].AttribCatID]}, AttributeID: {$in: enabledAttributeList}}).toArray()
			} else {
				attributeItemList = await attributesCollection.find({AttribCatID: mainPropertyItem[0].AttribCatID, AttributeID: {$in: enabledAttributeList}}).toArray()
			}
	
			var variants = []
			var optionValueList = []
			await asyncForEach3(attributeItemList, async (attributeItem) => {
				variants.push({
					option1: attributeItem.Attribute,
					price: attributeItem.Price
				})
				optionValueList.push(attributeItem.Attribute)
			})
			var variantData = {
				variants: variants,
				options: [
					{
						name: mainPropertyList['a' + mainPropertyItem[0].AttribCatID],
						values: optionValueList
					}
				]
			}
			shopify.product.update(product.shopifyProductId, variantData)
			.then(result => {
				productCollection.updateOne(
					{_id: product._id},
					{$set: {updatedOnline: 6}}
				).then(result => {
					console.log('created variants: ', product.ProductID)
				})
			})
			.catch(shopifyError => {
				console.log(product.ProductID)
				console.log(attributeItemList.length)
				// console.log(variantData)
				// process.exit()
				// var productError = new ProductError()
				// productError.title = product.ModelName
				// productError.dbProductId = product.ProductID
				// productError.reason = shopifyError
				// productError.save(err => {
				//     if (err) {
				//         return next(err)
				//     } else {
				//         console.log('Could not create variants with this ID: ', product.ProductID)
				//     }
				// })
			})
		} else {
			var productError = new ProductError()
			productError.title = product.ModelName
			productError.dbProductId = product.ProductID
			productError.reason = 'no attributes'
			productError.save()
		}
	})
	res.render('home')
})

router.get('/uploadAttributes', async (req, res, next) => {
	const client = await MongoClient.connect(mongoUrl)
	const mydb = client.db(dbName)
	const productCollection = mydb.collection('products')
	const productAttribCatCollection = mydb.collection('productattribcat')
	const productAttribCollection = mydb.collection('productattributes')
	const attribCatCollection = mydb.collection('attribcat')
	const attributesCollection = mydb.collection('attributes')
	const propertyNameString = "Display Type, Viewable Area, Overall Size, Insert Size, Poster Board Size, Interior Size, Menu Case Layout, Cork Board Frame Size, Letterboard Size, Corkboard Size, Panel Size, Helvetica Letter Sets, Graphic Insert, Dry Erase Board Size, Banner Stand, SignHolders, Display Width, Sidewalk Sign, Light Post Sign, Sign Panel , Sign Stand, Easy Tack Board Size, Cork Bar Length, Post Options , Poster Width, Clamps, Graphic Holders, Graphic Width, Fabric Graphic Size, Chalk Board Size, Reader Letter Sets, Message Panel Size, Wet Erase Board Size, Roman Letter Sets, Floor Stand, Style, Easel, Clamp Sign Stand, Counter Top Display, Marker Type, Sign Face, Letter Tracks, Additional Headers, Letter Set, Backing Board, Overall Sleeve Size, Overall Panel Size, Poster (Insert) Size, Finish, Portable Pole Sign, Marker Board Size, Header Panel, Brochure Holder, Newspaper Name, Newspaper Size, Wall Bracket, Moulding Display, Poster Size, Base Width, Tabletop Sign Stand, Pole/Base, Elliptical Stand, Banner Size, Magnetic Mount, Catalog Holders, Plastic Lenses"
	const mainPropertyNameList = propertyNameString.split(', ')
	var mainPropertyList = []
	var mainPropertyIDList = []

	await asyncForEach1(mainPropertyNameList, async (propertyName) => {
		var attribCat = await attribCatCollection.findOne({SiteID: 1, AttrCategory: propertyName})
		mainPropertyList['a' + attribCat.AttribCatID] = propertyName
		mainPropertyIDList.push(attribCat.AttribCatID)
	})
	const productList = await productCollection.find({SiteID: 1})
})

module.exports = router