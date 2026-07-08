setcpm(80)

$: n("5 3 4 2 3 1").scale("d3:whole:tone").s("clavisynth p").struct("x(3,8,-1)").add("[-12,0]").gain(.5)
$: n("0 1 2 3").gain(.5)
$: s("woodblock:1 woodblock:2*2 snare_rim:0 gong").slow(2).gain(.5)
