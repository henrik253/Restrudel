setcpm(34)

$: sound("square hh bd").gain(.6737).release(.2084).attack(.3)

$: note("a1 g1*2 a1*2 g1 ~ f#5@2 a#4@2 e5@2 d#5 ~ c#5@2 b4@2 a#4@2 ~ b4 ~ a#4@2 f#4@2").sound("sine num").lpf(1056)

$: s("gm_epiano1:1 0").room(.85).gain(.5).release(.08)
