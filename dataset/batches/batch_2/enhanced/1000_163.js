setcpm(100/4)

$: s("bd bd").gain("[0.8 0.4]*4").delay(.2376).delaytime(.1).delayfeedback(.6)

$: s("mt lt").clip(.95).release(.5).attack(.1).gain(.5)

$: s("~ hh ~ hh").gain(.2)

$: note("c2 eb2 g2 bb2").s("sawtooth").lpf(800).gain(.35)
