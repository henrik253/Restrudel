setcpm(100/4)

$: s("cr sd bd bd").velocity(.6).gain(0.3)

$: note("a1 f1 c2 g1").scale("c2:minor").sound("square bd").lpf(1614).room(1).delay(.5).gain(.496).release(.0727)

$: s("woodblock:1 woodblock:2*2").slow(2).gain(0.5)
