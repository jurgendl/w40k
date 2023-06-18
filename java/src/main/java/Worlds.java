import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.stream.Collectors;

public class Worlds {
	public static void main(String[] args) {
		String line = "";
		String[] parts = new String[0];
		try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File("worlds.txt"))));) {
			line = br.readLine();
			while ((line = br.readLine()) != null) {
				parts = line.split("\t");
				System.out.println("{\"world\":\"" + parts[0]//
						+ "\",\"aptitude\":\"" + parts[7]//
						+ "\"},");
			}
		} catch (Exception ex) {
			System.err.println(line);
			System.err.println(Arrays.stream(parts).collect(Collectors.joining(" --- ")));
			ex.printStackTrace();
		}
	}
}