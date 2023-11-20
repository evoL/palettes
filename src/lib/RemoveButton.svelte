<script>
  export let title = "Remove";
</script>

<button {title} on:click>&times;</button>

<style>
button {
  appearance: none;
  border: 0;
  padding: 0;
  line-height: 1em;
  width: 1em;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-bottom-right-radius: 4px;
  vertical-align: top;
}
button:hover {
  background: rgba(33,33,33,0.7);
}
</style>
