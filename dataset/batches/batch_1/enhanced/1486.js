setcpm(92/4)

$: n("0 -7 -1 -3 ~ -4 ~ -5 ~ -6 -5 -7@3").scale("d:minor").s("piano").release(.4).room(.5).gain(.4).slow(2)

$: n("<[-7,-5,-3] [-8,-6,-4]>").scale("d:minor").s("gm_synth_strings_1").attack(.3).release(.8).gain(.2).room(.8)

$: s("~ cp ~ cp").gain(.5).room(.4)

$: s("bd ~ ~ bd ~ ~ bd ~").gain(.7)

$: note("d2 ~ ~ ~ a1 ~ ~ ~").s("sawtooth").lpf(400).release(.3).gain(.45)
