import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.stream.Collectors;

public class Csv2Json {
	public static void main(String[] args) {
		String line = "";
		String[] parts = new String[0];
		try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File("talents.csv"))));) {
			line = br.readLine();
			while ((line = br.readLine()) != null) {
				parts = line.substring(1, line.length() - 1).split("\",\"");
				System.out.println("{\"Tier\":\"" + parts[0]//
						+ "\",\"Talent\":\"" + parts[1]//
						+ "\",\"Prerequisites\":\"" + parts[2]//
						+ "\",\"Aptitude 1\":\"" + parts[3]//
						+ "\",\"Aptitude 2\":\"" + parts[4]//
						+ "\",\"Benefit\":\"" + parts[5]//
						+ "\"},");
			}
		} catch (Exception ex) {
			System.err.println(line);
			System.err.println(Arrays.stream(parts).collect(Collectors.joining(" --- ")));
			ex.printStackTrace();
		}
	}
}
