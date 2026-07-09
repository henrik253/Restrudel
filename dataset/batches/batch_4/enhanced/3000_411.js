setcpm(120/4)

$: n("3 3 -1 ~ -1 -1 0 ~ 0").s("pulse gm_trumpet:2 gm_acoustic_guitar_steel:2 gm_drawbar_organ").gain("[1 0.6]*4").cutoff(235).decay(.2).sustain(0).degradeBy(.5).room(2)

$: s("cr sd").slow(4)

$: s("oh*4 bd!3").bank("Linn9000")
