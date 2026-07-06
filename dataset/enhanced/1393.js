setcpm(120/4)

$: note("<[c3,e3,g3,b3] [d3,f3,a3,c4]>").s("piano").release(.4).room(.4).gain(.4)

$: s("bd ~ [~ rim] ~ bd ~ rim ~").gain(.75)

$: note("c2*8").s("sawtooth").lpf(600).release(.1).gain("[.5 .35]*4")

$: n("~ ~ 7 ~ ~ 9 ~ 11").scale("c:major").s("gm_overdriven_guitar:2").gain(.25).delay(.3).release(.2)

$: s("hh*4").gain(.18)
