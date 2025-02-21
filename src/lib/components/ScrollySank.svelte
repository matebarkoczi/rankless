<script lang="ts">
	import {getSankeyPath, type Point} from '$lib/visual-util';
	import osuInst from '$lib/assets/data/osu-inst.json';
	import ubInst from '$lib/assets/data/ub-inst.json';
	import BrokenFittedText from './BrokenFittedText.svelte';

	export let sWidth: number;
	export let sHeight: number;
	export let isWideScreen: boolean;
	export let fixedPin: (s: number, e: number, os: number) => string;
	export let rateScale: (s: number, f: number) => number;

	type pDef = {
		cTop: Point;
		cBot: Point;
		widths: {parent: number; child: number};
		bottomStretch: number;
		topStretch: number;
	};
	const toP = (o: pDef) => getSankeyPath(o.cTop, o.cBot, o.widths, o.bottomStretch, o.topStretch);

	$: pad = isWideScreen ? 0.3 : 1.1;

	function topPlus(pO: pDef) {
		return pO.cTop.x + pO.widths.parent + pad;
	}
	function botPlus(pO: pDef) {
		return pO.cBot.x + pO.widths.child + pad;
	}

	$: h = sHeight / sWidth;

	$: topVh = fixedPin(170, 800, -5);
	$: mainInstObj = rateScale(6.4, 0.5) < 0.5 ? osuInst : ubInst;

	$: phaseTwo = rateScale(3.6, 2.2);

	$: topExtension = (1 - rateScale(0.8, 1.4)) * 150 * h;
	$: y = 3 * h + topExtension - phaseTwo * 10 * h;

	// width is normalized to 100
	// height is measured in 100h
	// should be basically the screen

	$: l1Bottom = (1 - rateScale(2.9, 0.7)) * 50 * h + 10 * h;
	function getS(c: {weight: number}[]): number {
		let o = 0;
		for (let i = 0; i < c.length; i++) {
			const ch = c[i];
			o += ch.weight;
		}
		return o;
	}
	function getL(
		c: {children: {weight: number; name: string}[]}[]
	): {name: string; weight: number}[] {
		const o = [];
		for (let i = 0; i < c.length; i++) {
			for (let j = 0; j < c[i].children.length; j++) {
				o.push(c[i].children[j]);
			}
		}
		return o;
	}
	$: osuSum = getS(mainInstObj);

	$: bottomMultiplier = isWideScreen ? 17 : 9 + phaseTwo * 27;

	$: p1Obj = {
		cTop: {x: isWideScreen ? 65 : 90, y},
		cBot: {
			x: isWideScreen ? 15 : 3 + phaseTwo * 20,
			y: y + 50 * h - phaseTwo * (isWideScreen ? 25 : 33) * h
		},
		widths: {
			parent: isWideScreen ? 4 : 1.5,
			child: (mainInstObj[0].weight / osuSum) * bottomMultiplier
		},
		bottomStretch: l1Bottom,
		topStretch: 2.5 * h + topExtension
	};

	$: p2Obj = {
		cTop: {x: topPlus(p1Obj), y},
		cBot: {x: botPlus(p1Obj), y: p1Obj.cBot.y},
		widths: {
			parent: isWideScreen ? 5 : 2,
			child: (mainInstObj[1].weight / osuSum) * bottomMultiplier
		},
		bottomStretch: l1Bottom,
		topStretch: 2.5 + topExtension
	};

	$: p1 = toP(p1Obj);
	$: p2 = toP(p2Obj);

	$: bottomStretch = (isWideScreen ? 15 : phaseTwo * 13) * h;
	$: topStretch = 3 * h;
	$: l2end = (isWideScreen ? 75 : 70 - phaseTwo * 30) * h;

	$: osuL2 = getL(mainInstObj);
	$: l2Sum = getS(osuL2) * (isWideScreen ? 1 : 0.5);

	$: getL2Obj = (tOff: number, bOff: number, parent: number, i: number) => ({
		cTop: {x: tOff, y: p1Obj.cBot.y + p1Obj.bottomStretch + topStretch + pad},
		cBot: {x: bOff, y: l2end},
		widths: {parent, child: ((osuL2[i] || {weight: 0}).weight / l2Sum) * 43},
		bottomStretch,
		topStretch
	});

	$: p11Obj = getL2Obj(p1Obj.cBot.x, 2, p1Obj.widths.child / 8, 0);
	$: p12Obj = getL2Obj(topPlus(p11Obj), botPlus(p11Obj), p1Obj.widths.child / 4, 1);
	$: p13Obj = getL2Obj(
		topPlus(p12Obj),
		botPlus(p12Obj),
		p1Obj.widths.child - p11Obj.widths.parent - p12Obj.widths.parent - 2 * pad,
		2
	);

	$: p21Obj = getL2Obj(p2Obj.cBot.x, botPlus(p13Obj), 2, 3);
	$: p22Obj = getL2Obj(topPlus(p21Obj), botPlus(p21Obj), 1, 4);
	$: p23Obj = getL2Obj(
		topPlus(p22Obj),
		botPlus(p22Obj),
		p2Obj.widths.child - p21Obj.widths.parent - p22Obj.widths.parent - 2 * pad,
		5
	);
</script>

<svg viewBox="0 0 100 {100 * h}" xmlns="http://www.w3.org/2000/svg" width="100%" height="110svh"
	style="top: {topVh}; --ms: {rateScale(6.4, 0.2) < 0.5 ? 0 : 500}ms">
	<defs>
		{#each [1, 2] as find}
		<linearGradient id="fade-{find}" gradientTransform="rotate(90)">
			<stop class="stop-{find}" offset="0%" stop-opacity="0%" />
			<stop class="stop-{find}" offset="10%" stop-opacity="2%" />
			<stop class="stop-{find}" offset="25%" stop-opacity="75%" />
			<stop class="stop-{find}" offset="100%" stop-opacity="80%" />
		</linearGradient>
		{/each}
	</defs>
	<path d={p1} fill="url(#fade-1)" />
	<path d={p2} fill="url(#fade-2)" />
	{#each [{ pO: p11Obj, cR: 5 }, { pO: p12Obj, cR: 20 }, { pO: p13Obj, cR: 50 }, { pO: p21Obj, cR: 60 }, { pO:
	p22Obj, cR: 70 }, { pO: p23Obj, cR: 90 }] as { pO, cR }, i}
	<path d={toP(pO)} style=" fill: rgb(var(--color-range-{cR}));" opacity="{phaseTwo * 75}%" />
	<g opacity="{Math.pow(phaseTwo, 2) * 100}%">
		<BrokenFittedText x={pO.cBot.x + pad} y={pO.cBot.y + bottomStretch - pad} text={osuL2[i].name}
			height={bottomStretch / 1.6} width={pO.widths.child - 2 * pad} />
	</g>
	{/each}
	<g opacity="{Math.pow(phaseTwo, 2) * 100}%">
		{#each [p1Obj, p2Obj] as pO, i}
		<BrokenFittedText x={pO.cBot.x + pad} y={pO.cBot.y + l1Bottom - pad} text={mainInstObj[i].name}
			height={l1Bottom - 2 * pad} width={pO.widths.child - 2 * pad} />
		{/each}
	</g>
</svg>

<style>
	:global(g) {
		transition: transform 0ms !important;
	}

	path {
		transition: d var(--ms);
	}

	.stop-1 {
		stop-color: rgb(var(--color-range-25));
	}

	.stop-2 {
		stop-color: rgb(var(--color-range-75));
	}

	svg {
		position: fixed;
		z-index: 3;
	}
</style>
