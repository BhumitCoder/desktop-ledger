import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as nextInvoiceNumber, c as PaymentRepo, f as SaleReturnRepo, g as genId, i as CompanyRepo, l as PurchaseRepo, o as ItemRepo, p as SalesRepo, s as PartyRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { K as Check, T as LoaderCircle, f as Save, h as Printer, i as UserPlus, k as FileText, m as Receipt, s as Trash2, t as X, v as Pencil } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { o as partyBalances } from "./ledger-DslW1yu4.mjs";
import { n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/InvoiceForm-Dt9Qd2o1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function numToWords(n) {
	const a = [
		"",
		"One",
		"Two",
		"Three",
		"Four",
		"Five",
		"Six",
		"Seven",
		"Eight",
		"Nine",
		"Ten",
		"Eleven",
		"Twelve",
		"Thirteen",
		"Fourteen",
		"Fifteen",
		"Sixteen",
		"Seventeen",
		"Eighteen",
		"Nineteen"
	];
	const b = [
		"",
		"",
		"Twenty",
		"Thirty",
		"Forty",
		"Fifty",
		"Sixty",
		"Seventy",
		"Eighty",
		"Ninety"
	];
	const inWords = (num) => {
		if (num < 20) return a[num];
		if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
		if (num < 1e3) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + inWords(num % 100) : "");
		if (num < 1e5) return inWords(Math.floor(num / 1e3)) + " Thousand" + (num % 1e3 ? " " + inWords(num % 1e3) : "");
		if (num < 1e7) return inWords(Math.floor(num / 1e5)) + " Lakh" + (num % 1e5 ? " " + inWords(num % 1e5) : "");
		return inWords(Math.floor(num / 1e7)) + " Crore" + (num % 1e7 ? " " + inWords(num % 1e7) : "");
	};
	const rupees = Math.floor(n);
	const paise = Math.round((n - rupees) * 100);
	let s = inWords(rupees) + " Rupees";
	if (paise) s += " and " + inWords(paise) + " Paise";
	return s + " Only";
}
function PrintableInvoice({ inv, company, mode }) {
	const gstOn = inv.gstEnabled !== false;
	const isSale = mode === "sale";
	const title = gstOn ? "TAX INVOICE" : isSale ? "INVOICE / BILL OF SUPPLY" : "PURCHASE BILL";
	const gstBuckets = {};
	let taxableTotal = 0;
	inv.lineItems.forEach((l) => {
		const taxable = l.qty * l.price * (1 - l.discountPct / 100);
		taxableTotal += taxable;
		if (gstOn) {
			const key = l.gstRate.toString();
			if (!gstBuckets[key]) gstBuckets[key] = {
				taxable: 0,
				tax: 0
			};
			gstBuckets[key].taxable += taxable;
			gstBuckets[key].tax += taxable * (l.gstRate / 100);
		}
	});
	const totalQty = inv.lineItems.reduce((s, l) => s + l.qty, 0);
	const cellStyle = {
		border: "1px solid #000",
		padding: "6px 8px",
		fontSize: 11
	};
	const th = {
		...cellStyle,
		background: "#f0f0f0",
		fontWeight: 700,
		textAlign: "left"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "print-area",
		style: {
			fontFamily: "Arial, sans-serif",
			color: "#000"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					textAlign: "center",
					borderBottom: "2px solid #000",
					paddingBottom: 8,
					marginBottom: 8
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 10,
							fontWeight: 600
						},
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 20,
							fontWeight: 800,
							marginTop: 2
						},
						children: company.name || "Your Company"
					}),
					company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { fontSize: 11 },
						children: company.address
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { fontSize: 11 },
						children: [
							company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Phone: ", company.phone] }),
							company.phone && company.email && " · ",
							company.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Email: ", company.email] })
						]
					}),
					gstOn && company.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: 11,
							fontWeight: 600
						},
						children: ["GSTIN: ", company.gstin]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
				style: {
					width: "100%",
					borderCollapse: "collapse",
					marginBottom: 8
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						...cellStyle,
						width: "60%",
						verticalAlign: "top"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 10,
								color: "#555",
								fontWeight: 600,
								marginBottom: 3
							},
							children: isSale ? "BILL TO" : "SUPPLIER"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 14,
								fontWeight: 700
							},
							children: inv.partyName || "—"
						}),
						inv.partyPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Phone: ", inv.partyPhone] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						...cellStyle,
						verticalAlign: "top"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						style: {
							width: "100%",
							fontSize: 11
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									fontWeight: 600,
									paddingRight: 6
								},
								children: "Invoice #:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: inv.number })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { fontWeight: 600 },
								children: "Date:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmtDate(inv.date) })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { fontWeight: 600 },
								children: "Payment:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { textTransform: "capitalize" },
								children: inv.paymentMode
							})] })
						] })
					})
				})] }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				style: {
					width: "100%",
					borderCollapse: "collapse"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							width: 28,
							textAlign: "center"
						},
						children: "#"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: th,
						children: "Item"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 55
						},
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							width: 45
						},
						children: "Unit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 75
						},
						children: "Price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 55
						},
						children: "Disc%"
					}),
					gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 55
						},
						children: "GST%"
					}),
					gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 75
						},
						children: "GST Amt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: {
							...th,
							textAlign: "right",
							width: 90
						},
						children: "Amount"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
					inv.lineItems.map((l, i) => {
						const taxable = l.qty * l.price * (1 - l.discountPct / 100);
						const gstAmt = gstOn ? taxable * (l.gstRate / 100) : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									textAlign: "center"
								},
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: l.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									textAlign: "right"
								},
								children: l.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: l.unit
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									textAlign: "right"
								},
								children: fmtMoney(l.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: {
									...cellStyle,
									textAlign: "right"
								},
								children: [l.discountPct, "%"]
							}),
							gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: {
									...cellStyle,
									textAlign: "right"
								},
								children: [l.gstRate, "%"]
							}),
							gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									textAlign: "right"
								},
								children: fmtMoney(gstAmt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									textAlign: "right",
									fontWeight: 600
								},
								children: fmtMoney(taxable + gstAmt)
							})
						] }, l.id);
					}),
					inv.lineItems.length < 6 && Array.from({ length: 6 - inv.lineItems.length }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								height: 20
							},
							children: "\xA0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: cellStyle })
					] }, "e" + i)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								fontWeight: 700
							},
							colSpan: 2,
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								textAlign: "right",
								fontWeight: 700
							},
							children: totalQty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: cellStyle,
							colSpan: gstOn ? 4 : 2
						}),
						gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								textAlign: "right",
								fontWeight: 700
							},
							children: fmtMoney(inv.taxAmount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								textAlign: "right",
								fontWeight: 700
							},
							children: fmtMoney(inv.subtotal + inv.taxAmount)
						})
					] })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
				style: {
					width: "100%",
					borderCollapse: "collapse",
					marginTop: 8
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						...cellStyle,
						width: "58%",
						verticalAlign: "top"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 10,
								fontWeight: 700,
								marginBottom: 4
							},
							children: "Amount in Words"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								fontStyle: "italic"
							},
							children: numToWords(inv.total)
						}),
						inv.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 10,
								fontWeight: 700,
								marginTop: 8,
								marginBottom: 3
							},
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { fontSize: 11 },
							children: inv.notes
						})] }),
						gstOn && Object.keys(gstBuckets).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginTop: 8 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 10,
									fontWeight: 700,
									marginBottom: 3
								},
								children: "Tax Summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								style: {
									width: "100%",
									borderCollapse: "collapse",
									fontSize: 10
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: th,
										children: "GST %"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: {
											...th,
											textAlign: "right"
										},
										children: "Taxable"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: {
											...th,
											textAlign: "right"
										},
										children: "CGST"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: {
											...th,
											textAlign: "right"
										},
										children: "SGST"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: {
											...th,
											textAlign: "right"
										},
										children: "Total Tax"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Object.entries(gstBuckets).map(([rate, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: cellStyle,
										children: [rate, "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											...cellStyle,
											textAlign: "right"
										},
										children: fmtMoney(v.taxable)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											...cellStyle,
											textAlign: "right"
										},
										children: fmtMoney(v.tax / 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											...cellStyle,
											textAlign: "right"
										},
										children: fmtMoney(v.tax / 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											...cellStyle,
											textAlign: "right"
										},
										children: fmtMoney(v.tax)
									})
								] }, rate)) })]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						...cellStyle,
						verticalAlign: "top",
						padding: 0
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						style: {
							width: "100%",
							borderCollapse: "collapse",
							fontSize: 12
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { padding: "5px 8px" },
								children: "Subtotal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "5px 8px",
									textAlign: "right"
								},
								children: fmtMoney(taxableTotal)
							})] }),
							inv.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { padding: "5px 8px" },
								children: "Discount"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: {
									padding: "5px 8px",
									textAlign: "right"
								},
								children: ["- ", fmtMoney(inv.discount)]
							})] }),
							gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { padding: "5px 8px" },
								children: "Total GST"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "5px 8px",
									textAlign: "right"
								},
								children: fmtMoney(inv.taxAmount)
							})] }),
							!!inv.roundOff && Math.abs(inv.roundOff) > .001 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { padding: "5px 8px" },
								children: "Round Off"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: {
									padding: "5px 8px",
									textAlign: "right"
								},
								children: [
									inv.roundOff > 0 ? "+" : "−",
									" ",
									fmtMoney(Math.abs(inv.roundOff))
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								style: {
									background: "#f0f0f0",
									fontWeight: 800,
									fontSize: 14
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "8px",
										borderTop: "2px solid #000"
									},
									children: "Grand Total"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "8px",
										textAlign: "right",
										borderTop: "2px solid #000"
									},
									children: fmtMoney(inv.total)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { padding: "5px 8px" },
								children: "Paid"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "5px 8px",
									textAlign: "right"
								},
								children: fmtMoney(inv.paid)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								style: { fontWeight: 700 },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										padding: "5px 8px",
										borderTop: "1px solid #000"
									},
									children: ["Balance ", inv.total - inv.paid > 0 ? "Due" : "Paid"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "5px 8px",
										textAlign: "right",
										borderTop: "1px solid #000"
									},
									children: fmtMoney(Math.abs(inv.total - inv.paid))
								})]
							})
						] })
					})
				})] }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
				style: {
					width: "100%",
					borderCollapse: "collapse",
					marginTop: 20
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						width: "50%",
						fontSize: 10,
						verticalAlign: "top",
						paddingRight: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 700,
								marginBottom: 4
							},
							children: "Terms & Conditions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "1. Goods once sold will not be taken back." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "2. Interest @18% p.a. will be charged on delayed payments." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "3. Subject to local jurisdiction." })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						width: "50%",
						textAlign: "right",
						verticalAlign: "bottom",
						paddingTop: 40
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							borderTop: "1px solid #000",
							display: "inline-block",
							paddingTop: 4,
							minWidth: 200,
							fontSize: 11,
							fontWeight: 600
						},
						children: [
							"For ",
							company.name || "Company",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontWeight: 400,
									fontSize: 10
								},
								children: "Authorised Signatory"
							})
						]
					})
				})] }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					textAlign: "center",
					marginTop: 12,
					fontSize: 10,
					color: "#555"
				},
				children: "This is a computer-generated invoice."
			})
		]
	});
}
function InvoiceForm({ mode, existing }) {
	const navigate = useNavigate();
	const company = CompanyRepo.get();
	const isSale = mode === "sale";
	const repo = isSale ? SalesRepo : PurchaseRepo;
	const partyFilter = (_p) => true;
	const [inv, setInv] = (0, import_react.useState)(() => existing ?? {
		id: "",
		number: nextInvoiceNumber(isSale ? company.invoicePrefix : company.purchasePrefix, repo.all()),
		date: today(),
		partyId: "",
		partyName: "",
		partyPhone: "",
		gstEnabled: company.enableGst !== false,
		lineItems: [],
		subtotal: 0,
		discount: 0,
		taxAmount: 0,
		total: 0,
		paid: 0,
		paymentMode: "cash",
		createdAt: "",
		notes: ""
	});
	const gstOn = inv.gstEnabled !== false;
	const [allParties, setAllParties] = (0, import_react.useState)(() => PartyRepo.all());
	const parties = (0, import_react.useMemo)(() => allParties.filter(partyFilter), [allParties]);
	const [items, setItems] = (0, import_react.useState)(() => ItemRepo.all());
	const partyRef = (0, import_react.useRef)(null);
	const phoneRef = (0, import_react.useRef)(null);
	const [partyQ, setPartyQ] = (0, import_react.useState)(existing?.partyName ?? "");
	const [phoneQ, setPhoneQ] = (0, import_react.useState)(existing?.partyPhone ?? "");
	const [partyOpen, setPartyOpen] = (0, import_react.useState)(false);
	const [partyIdx, setPartyIdx] = (0, import_react.useState)(0);
	const [numberEditing, setNumberEditing] = (0, import_react.useState)(false);
	const numberRef = (0, import_react.useRef)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const savingRef = (0, import_react.useRef)(false);
	const partyBalance = (0, import_react.useMemo)(() => {
		if (!inv.partyId) return null;
		return partyBalances(isSale ? SalesRepo.all() : PurchaseRepo.all(), isSale ? SaleReturnRepo.all() : PurchaseReturnRepo.all(), PaymentRepo.all().filter((p) => p.type === (isSale ? "in" : "out"))).find((b) => b.partyId === inv.partyId)?.balance ?? 0;
	}, [inv.partyId, isSale]);
	const partySuggests = (0, import_react.useMemo)(() => {
		const q = partyQ.trim().toLowerCase();
		const pq = phoneQ.trim();
		if (!q && !pq) return [];
		return parties.filter((p) => q && p.name.toLowerCase().includes(q) || pq && (p.phone ?? "").includes(pq)).slice(0, 8);
	}, [
		partyQ,
		phoneQ,
		parties
	]);
	(0, import_react.useEffect)(() => {
		partyRef.current?.focus();
	}, []);
	const r2 = (n) => Math.round(n * 100) / 100;
	const roundEnabled = company.enableRoundOff !== false;
	const recalc = (lines, discount = inv.discount, gst = gstOn) => {
		const subtotal = r2(lines.reduce((s, l) => s + l.qty * l.price, 0));
		const afterLineDisc = r2(lines.reduce((s, l) => s + r2(l.qty * l.price * (1 - l.discountPct / 100)), 0));
		const taxAmount = gst ? r2(lines.reduce((s, l) => s + r2(r2(l.qty * l.price * (1 - l.discountPct / 100)) * (l.gstRate / 100)), 0)) : 0;
		const rawTotal = Math.max(0, r2(afterLineDisc + taxAmount - discount));
		const total = roundEnabled ? Math.round(rawTotal) : rawTotal;
		return {
			subtotal,
			taxAmount,
			total,
			roundOff: r2(total - rawTotal)
		};
	};
	const selectParty = (p) => {
		setInv({
			...inv,
			partyId: p.id,
			partyName: p.name,
			partyPhone: p.phone ?? ""
		});
		setPartyQ(p.name);
		setPhoneQ(p.phone ?? "");
		setPartyOpen(false);
		setTimeout(() => document.getElementById("inv-date")?.focus(), 30);
	};
	const clearParty = () => {
		setInv({
			...inv,
			partyId: "",
			partyName: "",
			partyPhone: ""
		});
		setPartyQ("");
		setPhoneQ("");
		setTimeout(() => partyRef.current?.focus(), 30);
	};
	const addLineItem = (it) => {
		const existingLine = inv.lineItems.find((l) => l.itemId === it.id);
		if (existingLine) {
			updateLine(existingLine.id, { qty: existingLine.qty + 1 });
			toast.info(`${it.name} — quantity increased to ${existingLine.qty + 1}`);
			return;
		}
		const line = {
			id: genId(),
			itemId: it.id,
			name: it.name,
			qty: 1,
			unit: it.unit,
			price: isSale ? it.salePrice : it.purchasePrice,
			discountPct: 0,
			gstRate: it.gstRate,
			amount: 0,
			costPrice: it.purchasePrice
		};
		const gstMult = gstOn ? 1 + line.gstRate / 100 : 1;
		line.amount = r2(r2(line.qty * line.price * (1 - line.discountPct / 100)) * gstMult);
		const lines = [...inv.lineItems, line];
		setInv({
			...inv,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const addNewItemByName = (name) => {
		const existing = items.find((i) => i.name.trim().toLowerCase() === name.trim().toLowerCase());
		if (existing) {
			addLineItem(existing);
			return;
		}
		const newItem = ItemRepo.add({
			name: name.trim(),
			unit: "pcs",
			gstRate: 0,
			purchasePrice: 0,
			salePrice: 0,
			stock: 0,
			openingStock: 0
		});
		setItems(ItemRepo.all());
		addLineItem(newItem);
		toast.success(`New item added: ${newItem.name} — enter price & qty in the row`);
	};
	const updateLine = (id, patch) => {
		const lines = inv.lineItems.map((l) => {
			if (l.id !== id) return l;
			const nl = {
				...l,
				...patch
			};
			const gstMult = gstOn ? 1 + nl.gstRate / 100 : 1;
			nl.amount = r2(r2(nl.qty * nl.price * (1 - nl.discountPct / 100)) * gstMult);
			return nl;
		});
		setInv({
			...inv,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const removeLine = (id) => {
		const lines = inv.lineItems.filter((l) => l.id !== id);
		setInv({
			...inv,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const setDiscount = (d) => setInv({
		...inv,
		discount: d,
		...recalc(inv.lineItems, d)
	});
	const toggleGst = () => {
		const newGst = !gstOn;
		const lines = inv.lineItems.map((l) => {
			const gstMult = newGst ? 1 + l.gstRate / 100 : 1;
			return {
				...l,
				amount: l.qty * l.price * (1 - l.discountPct / 100) * gstMult
			};
		});
		setInv({
			...inv,
			gstEnabled: newGst,
			lineItems: lines,
			...recalc(lines, inv.discount, newGst)
		});
	};
	const save = (andPrint = false) => {
		if (savingRef.current) return;
		if (!inv.lineItems.length) {
			toast.error("Add at least one item");
			return;
		}
		const badLine = inv.lineItems.find((l) => !(l.qty > 0) || l.price < 0);
		if (badLine) {
			toast.error(`Check quantity/price for "${badLine.name}" — qty must be more than 0`);
			return;
		}
		const number = inv.number.trim();
		if (!number) {
			toast.error(`${isSale ? "Invoice" : "Bill"} number is required`);
			return;
		}
		if (repo.all().find((i) => i.number.trim() === number && i.id !== existing?.id)) {
			toast.error(`${isSale ? "Invoice" : "Bill"} number ${number} is already used — change it`);
			setNumberEditing(true);
			setTimeout(() => numberRef.current?.focus(), 50);
			return;
		}
		let paid = inv.paid;
		if (paid > inv.total) {
			paid = inv.total;
			toast.info(`Paid amount adjusted to bill total ${fmtMoney(inv.total)}`);
		}
		let partyId = inv.partyId;
		let partyName = inv.partyName || partyQ.trim();
		const phone = phoneQ.trim();
		if (!partyId) {
			if (!partyName && !phone) {
				toast.error("Enter customer name or phone");
				partyRef.current?.focus();
				return;
			}
			const byPhone = phone ? allParties.find((p) => (p.phone ?? "").trim() === phone) : null;
			const byName = partyName ? allParties.find((p) => p.name.toLowerCase() === partyName.toLowerCase()) : null;
			const existingParty = byPhone ?? byName;
			if (existingParty) {
				partyId = existingParty.id;
				partyName = existingParty.name;
			} else {
				const newParty = {
					id: genId(),
					name: partyName || `Party ${phone}`,
					type: "both",
					phone,
					openingBalance: 0,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				PartyRepo.add(newParty);
				setAllParties(PartyRepo.all());
				partyId = newParty.id;
				partyName = newParty.name;
				toast.success(`New party added: ${partyName}`);
			}
		}
		savingRef.current = true;
		setSaving(true);
		const finalInv = {
			...inv,
			number,
			paid,
			partyId,
			partyName,
			partyPhone: phone
		};
		if (existing?.id) {
			const origDelta = isSale ? 1 : -1;
			for (const l of existing.lineItems) {
				const it = ItemRepo.get(l.itemId);
				if (it) ItemRepo.adjustField(it.id, "stock", origDelta * l.qty);
			}
		}
		const stockDelta = isSale ? -1 : 1;
		for (const l of finalInv.lineItems) {
			const it = ItemRepo.get(l.itemId);
			if (!it) continue;
			const extra = {};
			if (l.price > 0) {
				if (isSale && !it.salePrice) extra.salePrice = l.price;
				if (!isSale && it.purchasePrice !== l.price) extra.purchasePrice = l.price;
			}
			ItemRepo.adjustField(it.id, "stock", stockDelta * l.qty, extra);
		}
		if (isSale) {
			const negative = finalInv.lineItems.map((l) => ItemRepo.get(l.itemId)).filter((it) => !!it && it.stock < 0);
			if (negative.length) toast.warning(`Stock below zero: ${negative.map((i) => i.name).join(", ")} — add purchase entry`);
			const party = PartyRepo.get(partyId);
			if (party?.creditLimit && partyBalance !== null) {
				const newBalance = partyBalance + (finalInv.total - finalInv.paid) - (existing ? Math.max(0, (existing.total ?? 0) - (existing.paid ?? 0)) : 0);
				if (newBalance > party.creditLimit) toast.warning(`${partyName} crossed credit limit ${fmtMoney(party.creditLimit)} — balance now ${fmtMoney(newBalance)}`);
			}
		}
		let savedId;
		if (existing?.id) {
			repo.update(existing.id, finalInv);
			savedId = existing.id;
			toast.success(`${isSale ? "Sale" : "Purchase"} ${finalInv.number} updated`);
		} else {
			savedId = repo.add(finalInv).id;
			toast.success(`${isSale ? "Sale" : "Purchase"} ${finalInv.number} saved`);
		}
		if (andPrint) navigate({
			to: isSale ? "/sales/$id" : "/purchase/$id",
			params: { id: savedId },
			search: { print: 1 }
		});
		else navigate({ to: isSale ? "/sales" : "/purchase" });
	};
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				save();
			}
			if (e.key === "Escape") navigate({ to: isSale ? "/sales" : "/purchase" });
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 md:px-5 py-3 border-b bg-card flex items-center justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `h-10 w-10 rounded-md flex items-center justify-center ${isSale ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`,
						children: isSale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-[17px] font-bold tracking-tight leading-tight",
							children: [
								existing ? "Edit" : "New",
								" ",
								isSale ? "Sale Invoice" : "Purchase Bill"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-semibold text-foreground",
								children: inv.number
							}), " · Tab/Enter to move · Ctrl+S save · Esc cancel"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 h-9 px-3 rounded-md border bg-background cursor-pointer select-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: gstOn,
								onChange: toggleGst,
								className: "accent-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[12px] font-semibold",
								children: "GST Bill"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => navigate({ to: isSale ? "/sales" : "/purchase" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Cancel"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => save(true),
							disabled: saving,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Save & Print"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => save(),
							disabled: saving,
							className: "bg-primary text-primary-foreground",
							children: [
								saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }),
								saving ? "Saving…" : "Save",
								!saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "ml-1 text-[10px] opacity-80",
									children: "Ctrl+S"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 md:p-5 space-y-4 overflow-auto flex-1 bg-muted/30",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card border rounded-lg shadow-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: isSale ? "Customer Details" : "Supplier Details"
								}), inv.partyId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] inline-flex items-center gap-1 text-success font-medium bg-success-soft px-2 py-0.5 rounded",
										children: "✓ Existing party"
									}), partyBalance !== null && Math.abs(partyBalance) > .01 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[11px] font-semibold px-2 py-0.5 rounded ${partyBalance > 0 ? "text-destructive bg-destructive/10" : "text-success bg-success-soft"}`,
										children: partyBalance > 0 ? `${isSale ? "Receivable" : "Payable"}: ${fmtMoney(partyBalance)}` : `Advance: ${fmtMoney(-partyBalance)}`
									})]
								}) : partyQ || phoneQ ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] inline-flex items-center gap-1 text-primary font-medium bg-primary-soft px-2 py-0.5 rounded",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3 w-3" }), " Will auto-create on save"]
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative lg:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex flex-col gap-1 text-[12px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground font-medium",
												children: [isSale ? "Customer Name" : "Supplier Name", " *"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													ref: partyRef,
													value: partyQ,
													onChange: (e) => {
														setPartyQ(e.target.value);
														setPartyOpen(true);
														setPartyIdx(0);
														if (inv.partyId) setInv({
															...inv,
															partyId: "",
															partyName: e.target.value
														});
													},
													onFocus: () => setPartyOpen(true),
													onBlur: () => setTimeout(() => setPartyOpen(false), 150),
													onKeyDown: (e) => {
														if (e.key === "ArrowDown") {
															e.preventDefault();
															setPartyIdx((i) => Math.min(partySuggests.length - 1, i + 1));
														} else if (e.key === "ArrowUp") {
															e.preventDefault();
															setPartyIdx((i) => Math.max(0, i - 1));
														} else if (e.key === "Enter") {
															e.preventDefault();
															if (partySuggests[partyIdx]) selectParty(partySuggests[partyIdx]);
															else phoneRef.current?.focus();
														}
													},
													className: "h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none flex-1",
													placeholder: "Type name or search…"
												}), inv.partyId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: clearParty,
													className: "h-9 w-9 rounded-md border bg-background hover:bg-accent text-muted-foreground flex items-center justify-center",
													title: "Clear",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
												})]
											})]
										}), partyOpen && partySuggests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute z-20 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-elevated max-h-64 overflow-auto",
											children: partySuggests.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												onMouseDown: (e) => {
													e.preventDefault();
													selectParty(p);
												},
												className: `px-3 py-2 text-sm cursor-pointer ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold",
													children: p.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] text-muted-foreground",
													children: [
														p.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["📞 ", p.phone] }),
														p.phone && p.gstin && " · ",
														p.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["GSTIN: ", p.gstin] })
													]
												})]
											}, p.id))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex flex-col gap-1 text-[12px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Phone Number"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: phoneRef,
											value: phoneQ,
											onChange: (e) => {
												const v = e.target.value;
												setPhoneQ(v);
												if (inv.partyId) setInv({
													...inv,
													partyId: "",
													partyPhone: v
												});
												if (v.length >= 10) {
													const match = allParties.find((p) => (p.phone ?? "").trim() === v.trim());
													if (match) selectParty(match);
												}
											},
											className: "h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none",
											placeholder: "10-digit phone (auto-match)",
											inputMode: "numeric"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										id: "inv-date",
										label: "Bill Date",
										type: "date",
										value: inv.date,
										onChange: (e) => setInv({
											...inv,
											date: e.target.value
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 md:grid-cols-3 gap-3 mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1 text-[12px] md:col-span-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: isSale ? "Invoice #" : "Bill #"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center gap-1",
											children: numberEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												ref: numberRef,
												value: inv.number,
												onChange: (e) => setInv({
													...inv,
													number: e.target.value
												}),
												onKeyDown: (e) => {
													if (e.key === "Enter" || e.key === "Escape") setNumberEditing(false);
												},
												className: "h-9 px-3 border-2 border-primary rounded-md bg-background focus:outline-none font-mono font-semibold text-primary flex-1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setNumberEditing(false),
												className: "h-9 w-9 flex items-center justify-center rounded-md border bg-success-soft text-success hover:opacity-80 transition flex-shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
											})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-9 px-3 border rounded-md bg-muted flex items-center font-mono font-semibold text-muted-foreground flex-1",
												children: inv.number
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													setNumberEditing(true);
													setTimeout(() => numberRef.current?.focus(), 30);
												},
												className: "h-9 w-9 flex items-center justify-center rounded-md border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition flex-shrink-0",
												title: "Edit invoice number",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
											})] })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: "Auto-generated · click ✎ to edit"
										})
									]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border rounded-lg bg-card shadow-card overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[13px] font-semibold",
								children: [
									"Items (",
									inv.lineItems.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground",
								children: "Type in search row to add items"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-[13px] min-w-[720px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-[11px] text-muted-foreground uppercase tracking-wider",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "bg-muted/40",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-3 py-2 w-8",
												children: "#"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-3 py-2",
												children: "Item"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right w-20 py-2",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left w-20 py-2",
												children: "Unit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right w-24 py-2",
												children: "Price"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right w-20 py-2",
												children: "Disc%"
											}),
											gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right w-20 py-2",
												children: "GST%"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right w-28 py-2 pr-3",
												children: "Amount"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8" })
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [inv.lineItems.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t hover:bg-accent/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5 text-muted-foreground text-[11px]",
											children: idx + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium",
												children: l.name
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												value: l.qty,
												onWheel: (e) => e.currentTarget.blur(),
												onChange: (e) => updateLine(l.id, { qty: parseFloat(e.target.value) || 0 }),
												className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: l.unit,
												onChange: (e) => updateLine(l.id, { unit: e.target.value }),
												className: "w-full h-7 px-1.5 border rounded bg-background focus:border-primary outline-none"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												value: l.price,
												onWheel: (e) => e.currentTarget.blur(),
												onChange: (e) => updateLine(l.id, { price: parseFloat(e.target.value) || 0 }),
												className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												value: l.discountPct,
												onWheel: (e) => e.currentTarget.blur(),
												onChange: (e) => updateLine(l.id, { discountPct: parseFloat(e.target.value) || 0 }),
												className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
											})
										}),
										gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												value: l.gstRate,
												onWheel: (e) => e.currentTarget.blur(),
												onChange: (e) => updateLine(l.id, { gstRate: parseFloat(e.target.value) || 0 }),
												className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "text-right px-3 py-1.5 font-semibold tabular-nums",
											children: fmtMoney(l.amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => removeLine(l.id),
												className: "text-destructive p-1 hover:bg-destructive/10 rounded",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})
										})
									]
								}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemPickerRow, {
									items,
									onAdd: addLineItem,
									onAddNew: addNewItemByName,
									gstOn
								})] })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:col-span-2 bg-card border rounded-lg shadow-card p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium uppercase text-[11px] tracking-wider",
									children: "Notes / Terms"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: inv.notes ?? "",
									onChange: (e) => setInv({
										...inv,
										notes: e.target.value
									}),
									placeholder: "Add any note or terms & conditions…",
									className: "min-h-[100px] px-3 py-2 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border rounded-lg bg-card shadow-card p-4 space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Subtotal",
									value: fmtMoney(inv.subtotal)
								}),
								gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Tax (GST)",
									value: fmtMoney(inv.taxAmount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Extra Discount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: inv.discount || "",
										onWheel: (e) => e.currentTarget.blur(),
										onChange: (e) => setDiscount(parseFloat(e.target.value) || 0),
										placeholder: "0",
										className: "w-28 h-8 px-2 text-right border rounded-md bg-background focus:border-primary outline-none tabular-nums"
									})]
								}),
								!!inv.roundOff && Math.abs(inv.roundOff) > .001 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Round Off",
									value: `${inv.roundOff > 0 ? "+" : "−"}${fmtMoney(Math.abs(inv.roundOff))}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center gap-2 pt-2 mt-1 border-t font-bold text-lg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-primary",
										children: fmtMoney(inv.total)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center gap-2 pt-2 mt-1 border-t",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Payment Mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: inv.paymentMode,
										onChange: (e) => {
											const mode = e.target.value;
											setInv({
												...inv,
												paymentMode: mode,
												paid: mode === "credit" ? 0 : inv.paid
											});
										},
										className: "w-28 h-8 px-2 border rounded-md bg-background focus:border-primary outline-none text-[13px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "cash",
												children: "Cash"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "upi",
												children: "UPI"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "bank",
												children: "Bank"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "cheque",
												children: "Cheque"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "credit",
												children: "Credit"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Paid Amount"
									}), inv.paymentMode === "credit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[12px] text-muted-foreground select-none",
										children: "₹0.00 — will pay later"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setInv({
												...inv,
												paid: inv.total
											}),
											className: "h-8 px-2 rounded-md border bg-success-soft text-success text-[11px] font-semibold hover:opacity-80 transition",
											title: "Received full amount",
											children: "Full"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: inv.paid || "",
											min: 0,
											onWheel: (e) => e.currentTarget.blur(),
											onChange: (e) => setInv({
												...inv,
												paid: parseFloat(e.target.value) || 0
											}),
											placeholder: "0",
											className: "w-24 h-8 px-2 text-right border rounded-md bg-background focus:border-primary outline-none tabular-nums"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center gap-2 pt-1 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balance Due" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `tabular-nums ${inv.total - inv.paid > 0 ? "text-destructive" : "text-success"}`,
										children: fmtMoney(Math.max(0, inv.total - inv.paid))
									})]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintableInvoice, {
				inv,
				company,
				mode
			})
		]
	});
}
function Row({ label, value, bold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between ${bold ? "font-semibold" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tabular-nums",
			children: value
		})]
	});
}
function ItemPickerRow({ items, onAdd, onAddNew, gstOn }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [idx, setIdx] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	const suggests = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()) || i.sku?.toLowerCase().includes(q.toLowerCase()) || i.barcode?.includes(q)).slice(0, 8);
	const trimmed = q.trim();
	const showAddNew = trimmed.length > 0 && !items.some((i) => i.name.trim().toLowerCase() === trimmed.toLowerCase());
	const optionCount = suggests.length + (showAddNew ? 1 : 0);
	const reset = () => {
		setQ("");
		setOpen(false);
		setTimeout(() => inputRef.current?.focus(), 30);
	};
	const pick = (it) => {
		onAdd(it);
		reset();
	};
	const pickNew = () => {
		onAddNew(trimmed);
		reset();
	};
	const choose = (i) => {
		if (i < suggests.length) pick(suggests[i]);
		else if (showAddNew) pickNew();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		className: "border-t bg-primary-soft/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
			colSpan: gstOn ? 9 : 8,
			className: "p-2 relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				value: q,
				onChange: (e) => {
					setQ(e.target.value);
					setOpen(true);
					setIdx(0);
				},
				onFocus: () => q && setOpen(true),
				onBlur: () => setTimeout(() => setOpen(false), 150),
				onKeyDown: (e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setIdx((i) => Math.min(optionCount - 1, i + 1));
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setIdx((i) => Math.max(0, i - 1));
					} else if (e.key === "Enter") {
						e.preventDefault();
						if (optionCount > 0) choose(idx);
					}
				},
				placeholder: "🔍  Type item name — pick from list or add as new item (Enter to add)",
				className: "w-full h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none text-sm"
			}), open && optionCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute z-20 top-full left-2 right-2 mt-1 border rounded-md bg-popover shadow-elevated max-h-64 overflow-auto",
				children: [suggests.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onMouseDown: (e) => {
						e.preventDefault();
						pick(it);
					},
					className: `px-3 py-2 text-sm cursor-pointer flex justify-between ${i === idx ? "bg-accent" : "hover:bg-accent"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: it.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted-foreground",
						children: [
							"Stock: ",
							it.stock,
							" ",
							it.unit
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold tabular-nums",
							children: fmtMoney(it.salePrice)
						}), gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted-foreground",
							children: [
								"GST ",
								it.gstRate,
								"%"
							]
						})]
					})]
				}, it.id)), showAddNew && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onMouseDown: (e) => {
						e.preventDefault();
						pickNew();
					},
					className: `px-3 py-2 text-sm cursor-pointer flex items-center gap-2 border-t ${idx === suggests.length ? "bg-accent" : "hover:bg-accent"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-5 w-5 rounded bg-primary-soft text-primary flex items-center justify-center text-xs font-bold",
						children: "+"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Add \"",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: trimmed
						}),
						"\" as new item — set price & qty in the row"
					] })]
				})]
			})]
		})
	});
}
//#endregion
export { InvoiceForm as t };
